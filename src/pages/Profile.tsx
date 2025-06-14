
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import PageContainer from "@/components/PageContainer";
import { PlanStatusCard } from "@/components/profile/PlanStatusCard";
import { ProfilePictureCard } from "@/components/profile/ProfilePictureCard";
import { DescriptionCard } from "@/components/profile/DescriptionCard";
import { PasswordChangeCard } from "@/components/profile/PasswordChangeCard";
import { SubscriptionManagementCard } from "@/components/profile/SubscriptionManagementCard";

const Profile = () => {
  const { user } = useAuth();
  const { getDisplayText, planType, subscriptionActive, subscriptionEndDate, loading } = useUserPlan();

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>

        <PlanStatusCard 
          loading={loading}
          planType={planType}
          subscriptionEndDate={subscriptionEndDate}
          getDisplayText={getDisplayText}
        />

        <ProfilePictureCard user={user} />

        <DescriptionCard />

        <PasswordChangeCard />

        <SubscriptionManagementCard subscriptionActive={subscriptionActive} />
      </div>
    </PageContainer>
  );
};

export default Profile;
