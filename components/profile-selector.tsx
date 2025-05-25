"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Search, Users, Shield, UserCheck, LogIn } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProfileSelectorProps {
  currentUser: string
  isAdmin: boolean
  onUserChange: (userName: string) => void
}

export function ProfileSelector({ currentUser, isAdmin, onUserChange }: ProfileSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customUserName, setCustomUserName] = useState("")
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const isAuthenticated = currentUser && currentUser !== ""

  // Fetch available users when dialog opens (only if authenticated as admin)
  useEffect(() => {
    if (isOpen && isAuthenticated && isAdmin) {
      fetchAvailableUsers()
    }
  }, [isOpen, isAuthenticated, isAdmin])

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users?currentUser=${encodeURIComponent(currentUser)}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data.users || [])
        setMessage(data.message || "")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (userName: string) => {
    onUserChange(userName)
    setIsOpen(false)
    setCustomUserName("")
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customUserName.trim()) {
      onUserChange(customUserName.trim())
      setIsOpen(false)
      setCustomUserName("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <LogIn className="h-4 w-4" />
              Login / Enter Name
            </>
          ) : (
            <>
              {isAdmin ? <Shield className="h-4 w-4 text-orange-600" /> : <User className="h-4 w-4" />}
              Profile: {currentUser}
              {isAdmin && <Badge variant="secondary">Admin</Badge>}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <LogIn className="h-5 w-5 text-blue-600" />
                Login to Learning Platform
              </>
            ) : isAdmin ? (
              <>
                <Shield className="h-5 w-5 text-orange-600" />
                Admin Dashboard Access
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                User Dashboard Access
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {!isAuthenticated
              ? "Enter your name to access your personalized learning dashboard with real data."
              : isAdmin
                ? "As an admin, you can view any user's dashboard or switch to your own."
                : "Enter your name to access your personal dashboard."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Welcome Message for Non-Authenticated Users */}
          {!isAuthenticated && (
            <div className="p-3 rounded-lg text-sm bg-blue-50 text-blue-800 border border-blue-200">
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span className="font-medium">Welcome!</span>
              </div>
              <p className="mt-1">
                You're currently viewing demo data. Enter your name below to access your real dashboard with live data
                from the database.
              </p>
            </div>
          )}

          {/* Admin Message */}
          {isAuthenticated && message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                isAdmin
                  ? "bg-orange-50 text-orange-800 border border-orange-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Available Users (Admin Only) */}
          {isAuthenticated && isAdmin && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Users in Database
              </Label>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading users...</div>
              ) : availableUsers.length > 0 ? (
                <Select onValueChange={handleUserSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select any user to view their dashboard" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.name} value={user.name}>
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          {user.role === "admin" && (
                            <Badge variant="outline" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">No users found in database</div>
              )}
            </div>
          )}

          {/* User Name Input */}
          <div className="space-y-2">
            <Label htmlFor="custom-user" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {!isAuthenticated ? "Enter Your Name to Login" : isAdmin ? "Or Enter Any User Name" : "Enter Your Name"}
            </Label>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <Input
                id="custom-user"
                placeholder={
                  !isAuthenticated
                    ? "Enter your name (e.g., yeswanth, haridra, monika)"
                    : isAdmin
                      ? "Enter any user name to view their dashboard"
                      : "Enter your exact name as registered"
                }
                value={customUserName}
                onChange={(e) => setCustomUserName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!customUserName.trim()}>
                {!isAuthenticated ? "Login" : isAdmin ? "View Dashboard" : "Access My Dashboard"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              {!isAuthenticated
                ? "Your role (admin/user) will be determined automatically after login"
                : isAdmin
                  ? "As admin, you can access any user's dashboard"
                  : "You can only access your own dashboard data"}
            </p>
          </div>

          {/* Quick Access Buttons */}
          <div className="space-y-2">
            <Label>Quick Access</Label>
            <div className="flex gap-2 flex-wrap">
              {!isAuthenticated || isAdmin ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleUserSelect("yeswanth")}>
                    <Shield className="mr-1 h-3 w-3" />
                    yeswanth
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUserSelect("haridra")}>
                    <Shield className="mr-1 h-3 w-3" />
                    haridra
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUserSelect("monika")}>
                    <UserCheck className="mr-1 h-3 w-3" />
                    monika
                  </Button>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Please enter your name above to access your dashboard
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
