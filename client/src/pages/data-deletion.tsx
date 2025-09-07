import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Mail, Trash2 } from "lucide-react";

export default function DataDeletion() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the deletion request to your backend
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← Back to BingeBoard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Deletion Request
            </CardTitle>
            <CardDescription>
              Request deletion of your personal data from BingeBoard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div className="text-sm text-orange-800 dark:text-orange-200">
                      <p className="font-medium mb-1">Important Information</p>
                      <p>
                        Deleting your data will permanently remove your account, watch lists, friends, and all associated data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the email associated with your BingeBoard account
                    </p>
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium mb-2">
                      Reason for Deletion (Optional)
                    </label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Help us improve by sharing why you're leaving..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button type="submit" variant="destructive" className="w-full">
                  Submit Deletion Request
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Mail className="h-12 w-12 text-green-600 mx-auto" />
                </div>
                <h3 className="text-lg font-medium mb-2">Request Submitted</h3>
                <p className="text-muted-foreground mb-4">
                  Your data deletion request has been received. We will process your request within 30 days and send a confirmation email to <strong>{email}</strong>.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you have any questions, please contact us through our support channels.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 prose prose-slate dark:prose-invert max-w-none">
          <h2>What Data Will Be Deleted?</h2>
          <p>When you request data deletion, we will remove:</p>
          <ul>
            <li>Your account profile and login information</li>
            <li>All watch lists, ratings, and preferences</li>
            <li>Friend connections and social interactions</li>
            <li>Activity history and usage data</li>
            <li>Any connected social media account associations</li>
          </ul>

          <h2>Processing Timeline</h2>
          <p>
            Data deletion requests are typically processed within 30 days. You will receive an email confirmation once the deletion is complete.
          </p>

          <h2>What Happens Next?</h2>
          <ol>
            <li>We verify your identity and account ownership</li>
            <li>Your account is deactivated immediately</li>
            <li>All personal data is permanently deleted from our systems</li>
            <li>You receive email confirmation of deletion</li>
          </ol>

          <h2>Contact Information</h2>
          <p>
            If you need immediate assistance or have questions about data deletion, please contact us through the BingeBoard platform before submitting this request.
          </p>
        </div>
      </div>
    </div>
  );
}