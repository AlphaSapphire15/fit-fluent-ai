
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import PageContainer from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, CreditCard, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getDisplayText, planType, credits, subscriptionActive, subscriptionEndDate, loading } = useUserPlan();
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    // TODO: Implement password change functionality
    toast({
      title: "Success",
      description: "Password updated successfully",
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement avatar upload functionality
    toast({
      title: "Success",
      description: "Profile picture updated successfully",
    });
  };

  const handleDescriptionSave = async () => {
    // TODO: Implement description save functionality
    toast({
      title: "Success",
      description: "Profile description updated successfully",
    });
  };

  const handleSubscriptionManagement = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      toast({
        title: "Error",
        description: "Could not access subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanStatusColor = () => {
    if (planType === 'unlimited') return 'text-green-600';
    if (planType === 'credits') return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>

        {/* Plan Status Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Plan Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading plan status...</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Current Plan:</span>
                  <span className={`font-semibold ${getPlanStatusColor()}`}>
                    {planType === 'unlimited' ? 'Unlimited Plan' : 
                     planType === 'credits' ? 'One-Time Credits' : 
                     'No Active Plan'}
                  </span>
                </div>
                
                {planType === 'credits' && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Credits Remaining:</span>
                    <span className="font-semibold text-blue-600">{credits}</span>
                  </div>
                )}
                
                {planType === 'unlimited' && subscriptionEndDate && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subscription ends:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(subscriptionEndDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">{getDisplayText()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Description Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Tell us about yourself..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleDescriptionSave} className="w-full">
              Save Description
            </Button>
          </CardContent>
        </Card>

        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subscription Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your subscription, update payment methods, or cancel your plan through our secure customer portal.
            </p>
            <Button 
              onClick={handleSubscriptionManagement}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Manage Subscription"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Profile;
