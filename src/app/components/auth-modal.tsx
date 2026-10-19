import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { toast } from "sonner";
import { login, signup, StoredUser } from "../database";
import { Country, State, City } from "country-state-city";

interface AuthModalProps {
  isOpen: boolean;
  onAuthSuccess: (
    userType: "admin" | "doctor" | "patient",
    userData?: any,
  ) => void;
}

export interface UserData {
  name: string;
  email: string;
  password: string;
  dob: string;
  age: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  occupation: string;
}

export function AuthModal({
  isOpen,
  onAuthSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<
    "signin" | "signup"
  >("signin");

  // Sign In state
  const [signInData, setSignInData] = useState({
    identifier: "",
    password: "",
  });

  // Sign Up state
  const [signUpData, setSignUpData] = useState<UserData>({
    name: "",
    email: "",
    password: "",
    dob: "",
    age: "",
    gender: "",
    city: "",
    state: "",
    country: "",
    occupation: "",
  });

  // Get all countries
  const countries = useMemo(() => Country.getAllCountries(), []);

  // Get selected country object
  const selectedCountry = useMemo(() => {
    return countries.find(country => country.name === signUpData.country);
  }, [countries, signUpData.country]);

  // Get states for selected country
  const states = useMemo(() => {
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [selectedCountry]);

  // Get selected state object
  const selectedState = useMemo(() => {
    return states.find(state => state.name === signUpData.state);
  }, [states, signUpData.state]);

  // Get cities for selected state
  const cities = useMemo(() => {
    if (!selectedCountry || !selectedState) return [];
    return City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
  }, [selectedCountry, selectedState]);

  const MIN_DOB = "1926-01-01";
  const MAX_AGE = 100;
  const today = new Date().toISOString().split("T")[0];

  const validateSignUpData = () => {
    const ageNumber = Number(signUpData.age);
    if (signUpData.age && (Number.isNaN(ageNumber) || ageNumber < 0 || ageNumber > MAX_AGE)) {
      toast.error(`Age must be a number between 0 and ${MAX_AGE}.`);
      return false;
    }

    if (signUpData.dob) {
      const dobDate = new Date(signUpData.dob);
      const minDobDate = new Date(MIN_DOB);
      if (isNaN(dobDate.getTime()) || dobDate < minDobDate) {
        toast.error(`Date of Birth must be ${MIN_DOB} or later.`);
        return false;
      }
    }

    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await login(signInData.identifier, signInData.password);
      const welcomeName =
        user.role === "admin"
          ? "Admin"
          : user.role === "doctor"
          ? `Dr. ${user.name}`
          : user.name;

      toast.success(`Login successful! Welcome ${welcomeName}`);
      onAuthSuccess(user.role, user);
    } catch {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignUpData()) {
      return;
    }

    try {
      const result = await signup(signUpData);
      if ("status" in result && result.status === "pending") {
        toast.success(
          "Doctor signup is pending admin approval. You can sign in once approved.",
        );
      } else {
        toast.success(
          "Account created successfully! You can now sign in.",
        );
      }

      setActiveTab("signin");
      setSignInData({
        identifier: result.email,
        password: "",
      });
      setSignUpData({
        name: "",
        email: "",
        password: "",
        dob: "",
        age: "",
        gender: "",
        city: "",
        state: "",
        country: "",
        occupation: "",
      });
    } catch (error: any) {
      toast.error(error?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        hideClose
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-green-800">
            Ayurveda CRM
          </DialogTitle>
          <DialogDescription>
            Sign in to access your account or sign up to create
            a new patient account
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-identifier">
                  Email ID / Username
                </Label>
                <Input
                  id="signin-identifier"
                  type="text"
                  placeholder="Enter your email or username"
                  value={signInData.identifier}
                  onChange={(e) =>
                    setSignInData({
                      ...signInData,
                      identifier: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">
                  Password
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInData.password}
                  onChange={(e) =>
                    setSignInData({
                      ...signInData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-800 hover:bg-green-700"
              >
                Sign In
              </Button>
            </form>

            <p className="text-sm text-center text-gray-600 mt-4">
              Patients, Doctors, and Admins can sign in above.
              New patient? Sign up to create an account.
            </p>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">
                    Full Name *
                  </Label>
                  <Input
                    id="signup-name"
                    placeholder="Enter your full name"
                    value={signUpData.name}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    Email ID *
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpData.email}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    Password *
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-dob">
                    Date of Birth *
                  </Label>
                  <Input
                    id="signup-dob"
                    type="date"
                    min={MIN_DOB}
                    max={today}
                    value={signUpData.dob}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        dob: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-age">Age *</Label>
                  <Input
                    id="signup-age"
                    type="number"
                    min={0}
                    max={MAX_AGE}
                    placeholder="Enter your age"
                    value={signUpData.age}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        age: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-gender">
                    Gender *
                  </Label>
                  <select
                    id="signup-gender"
                    value={signUpData.gender}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        gender: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-country">
                    Country *
                  </Label>
                  <Input
                    id="signup-country"
                    list="country-list"
                    placeholder="Select or type country"
                    value={signUpData.country}
                    onChange={(e) => {
                      const nextCountry = e.target.value;
                      setSignUpData({
                        ...signUpData,
                        country: nextCountry,
                        state: "",
                        city: "",
                      });
                    }}
                    required
                  />
                  <datalist id="country-list">
                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-state">State *</Label>
                  <Input
                    id="signup-state"
                    list="state-list"
                    placeholder="Select or type state"
                    value={signUpData.state}
                    onChange={(e) => {
                      const nextState = e.target.value;
                      setSignUpData({
                        ...signUpData,
                        state: nextState,
                        city: "",
                      });
                    }}
                    required
                  />
                  <datalist id="state-list">
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-city">City *</Label>
                  <Input
                    id="signup-city"
                    list="city-list"
                    placeholder="Select or type city"
                    value={signUpData.city}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        city: e.target.value,
                      })
                    }
                    required
                  />
                  <datalist id="city-list">
                    {cities.map((city) => (
                      <option key={city.name} value={city.name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-occupation">
                    Occupation *
                  </Label>
                  <select
                    id="signup-occupation"
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    value={signUpData.occupation}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        occupation: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select role</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-800 hover:bg-green-700"
              >
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}