import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CloudRain, Sparkles, LogOut } from "lucide-react";
import WeatherForm from "@/components/WeatherForm";
import WeatherResults from "@/components/WeatherResults";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero text-primary-foreground p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 relative">
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="absolute top-0 right-0 bg-card/50 backdrop-blur"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <CloudRain className="w-16 h-16" />
            <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            WeatherFortune
          </h1>
          <p className="text-primary-foreground/80 text-lg mt-2">
            Your personalized health & weather forecast
          </p>
        </header>

        <main>
          <div className="bg-card/20 backdrop-blur-lg rounded-2xl shadow-card p-6 md:p-8 border border-border">
            <WeatherForm onResults={setResults} />
          </div>

          {results && <WeatherResults data={results} />}
        </main>
      </div>
    </div>
  );
};

export default Index;
