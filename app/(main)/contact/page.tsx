"use client"
import { useState } from "react";
import { Mail, Phone, MapPin, Send,  XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { sendContactEmail } from "@/actions/contact";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  // const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // setSuccess(null);
    setError(null);
    try {
      const res = await sendContactEmail(form);
      if (res && res.success) {
        // setSuccess("Your message has been sent! We'll get back to you soon.");
        toast.success("Your message has been sent! We'll get back to you soon.")
        setForm({ name: "", email: "", message: "" });
      } else {
        setError("Failed to send message. Please try again later.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen ">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[200px] bg-blue-400/10 dark:bg-blue-800/20 rounded-full blur-2xl" />
      </div>
      <div className="container relative z-10 mx-auto px-4 py-12 flex flex-col items-center">
        {/* Header Section */}
        <div className="max-w-full mx-auto mb-10 text-center">
          <Badge
            variant="outline"
            className="bg-blue-100 dark:bg-blue-900/30 border-blue-400/30 dark:border-blue-700/30 px-4 py-1 text-blue-600 dark:text-blue-300 text-sm font-medium mb-4 shadow-sm"
          >
            Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-blue-500 bg-clip-text text-transparent mb-4 drop-shadow-sm">
            Contact Us
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            We&apos;re here to help! Reach out with your questions, feedback, or partnership inquiries.
          </p>
        </div>
        {/* Contact Card & Form */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Contact Info Card */}
          <Card className="bg-white/90 dark:bg-slate-900/90 border border-blue-100 dark:border-blue-900/30 rounded-2xl shadow-xl flex flex-col justify-between">
            <CardContent className="p-8 flex flex-col gap-6 h-full">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                <span className="text-zinc-700 dark:text-zinc-200 text-base font-medium">abhisheksingh159084@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                <span className="text-zinc-700 dark:text-zinc-200 text-base font-medium">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                <span className="text-zinc-700 dark:text-zinc-200 text-base font-medium">ABV-IIITM Gwalior</span>
              </div>
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Support Hours</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">Monday - Friday: 8:00 AM - 8:00 PM<br />Saturday - Sunday: 9:00 AM - 5:00 PM</p>
              </div>
            </CardContent>
          </Card>
          {/* Contact Form */}
          <Card className="bg-white/90 dark:bg-slate-900/90 border border-blue-100 dark:border-blue-900/30 rounded-2xl shadow-xl flex flex-col justify-between">
            <CardContent className="p-8 flex flex-col gap-6 h-full">
              <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="name" className="block text-zinc-700 dark:text-zinc-200 font-medium mb-1">Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-zinc-700 dark:text-zinc-200 font-medium mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    className="w-full px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-zinc-700 dark:text-zinc-200 font-medium mb-1">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition resize-none"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow transition disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? <span>Sending...</span> : <><Send className="h-5 w-5" />Send Message</>}
                </button>
                {error && <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-2"><XCircle className="h-4 w-4" />{error}</div>}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}