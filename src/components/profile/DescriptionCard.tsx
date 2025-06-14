
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export const DescriptionCard = () => {
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleDescriptionSave = async () => {
    // TODO: Implement description save functionality
    toast({
      title: "Success",
      description: "Profile description updated successfully",
    });
  };

  return (
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
  );
};
