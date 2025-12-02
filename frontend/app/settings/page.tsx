import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const teamMembers = [
  { id: 1, name: "John Doe", email: "john.doe@acmelogistics.com", role: "Admin", status: "active" },
  { id: 2, name: "Sarah Williams", email: "sarah.w@acmelogistics.com", role: "Operations Manager", status: "active" },
  { id: 3, name: "Mike Johnson", email: "mike.j@acmelogistics.com", role: "Dispatcher", status: "active" },
  { id: 4, name: "Emily Chen", email: "emily.c@acmelogistics.com", role: "Warehouse Staff", status: "active" },
  { id: 5, name: "Robert Brown", email: "robert.b@acmelogistics.com", role: "Driver", status: "inactive" },
]

const roleColors: Record<string, string> = {
  Admin: "bg-secondary/10 text-secondary border-secondary/20",
  "Operations Manager": "bg-info/10 text-info border-info/20",
  Dispatcher: "bg-success/10 text-success border-success/20",
  "Warehouse Staff": "bg-warning/10 text-warning border-warning/20",
  Driver: "bg-primary/10 text-primary border-primary/20",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and system preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/avatars/user.png" alt="User" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input defaultValue="john.doe@acmelogistics.com" type="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input defaultValue="+1 (555) 123-4567" type="tel" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input defaultValue="Operations Manager" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <Select defaultValue="est">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                      <SelectItem value="cst">Central Time (CT)</SelectItem>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage users and their roles</CardDescription>
                </div>
                <Button>Invite User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[member.role]}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === "active" ? "default" : "secondary"}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Shipment Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about shipment status changes</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Inventory Alerts</p>
                  <p className="text-sm text-muted-foreground">Low stock and reorder notifications</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Daily Summary</p>
                  <p className="text-sm text-muted-foreground">Receive a daily operations summary</p>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Global settings for the logistics platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Currency</label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (Euro)</SelectItem>
                      <SelectItem value="gbp">GBP (Pound)</SelectItem>
                      <SelectItem value="jpy">JPY (Yen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight Unit</label>
                  <Select defaultValue="kg">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Distance Unit</label>
                  <Select defaultValue="km">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kilometers (km)</SelectItem>
                      <SelectItem value="mi">Miles (mi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Select defaultValue="mdy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Link 
        href="/demo_script" 
        className="fixed bottom-4 right-4 text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors"
      >
        Demo Script
      </Link>
    </div>
  )
}
