import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WeatherFormProps {
  onResults: (data: any) => void;
}

const WeatherForm = ({ onResults }: WeatherFormProps) => {
  const [location, setLocation] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exercises, setExercises] = useState("no");
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleHealthConditionChange = (condition: string, checked: boolean) => {
    if (condition === "None") {
      setHealthConditions(checked ? ["None"] : []);
    } else {
      setHealthConditions((prev) => {
        const filtered = prev.filter((c) => c !== "None");
        return checked
          ? [...filtered, condition]
          : filtered.filter((c) => c !== condition);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("get-weather-fortune", {
        body: {
          location,
          fromDate,
          toDate,
          exercises: exercises === "yes",
          healthConditions,
        },
      });

      if (error) throw error;
      onResults(data);
      toast.success("Weather fortune ready!");
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <Label className="text-lg font-semibold text-center block mb-3">Location</Label>
        <div className="relative max-w-lg mx-auto">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="e.g., New York, USA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="pl-12 rounded-full text-lg h-12"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold block mb-3">Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
                className="bg-background"
              />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="bg-background"
              />
            </div>
          </div>

          <div>
            <Label className="text-lg font-semibold block mb-3">Do you exercise regularly?</Label>
            <RadioGroup value={exercises} onValueChange={setExercises}>
              <div className="flex gap-4 bg-background rounded-lg p-2">
                <div className="flex-1">
                  <RadioGroupItem value="yes" id="yes" className="peer sr-only" />
                  <Label
                    htmlFor="yes"
                    className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-all"
                  >
                    Yes
                  </Label>
                </div>
                <div className="flex-1">
                  <RadioGroupItem value="no" id="no" className="peer sr-only" />
                  <Label
                    htmlFor="no"
                    className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-all"
                  >
                    No
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label className="text-lg font-semibold block mb-3">Pre-existing Health Conditions?</Label>
          <div className="space-y-3 bg-background p-4 rounded-lg">
            {["Asthma", "Diabetes", "High BP", "None"].map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={condition}
                  checked={healthConditions.includes(condition)}
                  onCheckedChange={(checked) =>
                    handleHealthConditionChange(condition, checked as boolean)
                  }
                  disabled={condition !== "None" && healthConditions.includes("None")}
                />
                <Label htmlFor={condition} className="font-medium cursor-pointer">
                  {condition === "High BP" ? "High Blood Pressure" : condition}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full text-lg h-14 bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          <Zap className="w-6 h-6 mr-2" />
          {loading ? "Getting Your Fortune..." : "Get My WeatherFortune"}
        </Button>
      </div>
    </form>
  );
};

export default WeatherForm;
