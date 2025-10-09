import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const Join = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    skills: "",
    motivation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted!",
      description: "We'll get back to you within 48 hours.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      year: "",
      skills: "",
      motivation: "",
    });
  };

  const benefits = [
    "Hands-on experience in social media management",
    "Networking opportunities with industry professionals",
    "Skill development workshops and training",
    "Certificate of participation and achievements",
    "Portfolio building projects",
    "Leadership opportunities",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 text-white">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            RECRUITMENT
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Ready to be part of something extraordinary? Join VIVIDH and unleash your creative potential
          </motion.p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white text-center mb-12"
          >
            Why Join VIVIDH?
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 text-white"
              >
                <CheckCircle2 className="text-[hsl(var(--electric-blue))] flex-shrink-0 mt-1" size={24} />
                <span className="text-gray-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">APPLICATION FORM</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 border-2 border-black focus:border-[hsl(var(--electric-blue))] focus:ring-[hsl(var(--electric-blue))] text-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 border-2 border-black focus:border-[hsl(var(--electric-blue))] focus:ring-[hsl(var(--electric-blue))] text-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 border-2 border-black focus:border-[hsl(var(--electric-blue))] focus:ring-[hsl(var(--electric-blue))] text-gray-50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-2 border-2 border-black focus:border-[hsl(var(--electric-blue))] focus:ring-[hsl(var(--electric-blue))] text-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="mt-2 border-2 border-black focus:border-[hsl(var(--electric-blue))] focus:ring-[hsl(var(--electric-blue))] text-gray-50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="skills">Skills & Interests *</Label>
                <Textarea
                  id="skills"
                  required
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="mt-2 border-2 border-black focus:border-[hsl(var(--electric-blue))] focus:ring-[hsl(var(--electric-blue))] min-h-[100px] text-gray-50"
                  placeholder="Tell us about your skills (e.g., content creation, design, coding, marketing)"
                />
              </div>

              <div>
                <Label htmlFor="motivation">Why do you want to join VIVIDH? *</Label>
                <Textarea
                  id="motivation"
                  required
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  className="mt-2 border-2 border-black focus:border-[hsl(var(--electric-blue))] focus:ring-[hsl(var(--electric-blue))] min-h-[120px] text-gray-50"
                  placeholder="Share your motivation and what you hope to contribute"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-[hsl(var(--electric-blue))] hover:text-black font-bold py-6 text-lg transition-all duration-300"
              >
                SUBMIT APPLICATION
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Join;
