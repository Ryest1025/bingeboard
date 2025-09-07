import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Shield, AlertTriangle, Users, Scale } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-teal-400" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                By accessing and using BingeBoard ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of our entertainment tracking platform operated by BingeBoard ("us", "we", or "our").
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-teal-400" />
                User Accounts & Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Account Creation</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You must be at least 13 years old to create an account</li>
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>You are responsible for all activities under your account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Acceptable Use</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use the service for personal, non-commercial purposes</li>
                  <li>Respect other users and maintain appropriate conduct</li>
                  <li>Do not share false or misleading information</li>
                  <li>Report inappropriate content or behavior</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Prohibited Activities</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Using automated scripts or bots without permission</li>
                  <li>Harassment, hate speech, or discriminatory content</li>
                  <li>Violation of intellectual property rights</li>
                  <li>Sharing content that violates applicable laws</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-teal-400" />
                Privacy & Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Collection</h3>
                <p>
                  Your privacy is important to us. Our collection and use of personal information is governed by our 
                  <Link href="/privacy-policy" className="text-teal-400 hover:text-teal-300 underline ml-1">
                    Privacy Policy
                  </Link>, which is incorporated by reference into these Terms.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">User Content</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You retain ownership of content you create or upload</li>
                  <li>You grant us a license to use your content to provide our services</li>
                  <li>You are responsible for the content you share</li>
                  <li>We may remove content that violates our policies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Scale className="w-5 h-5 mr-2 text-teal-400" />
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Our Property</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>BingeBoard platform, design, and features are our intellectual property</li>
                  <li>Our trademarks, logos, and branding are protected</li>
                  <li>You may not copy, modify, or redistribute our platform</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Third-Party Content</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Show information and images are provided by The Movie Database (TMDB)</li>
                  <li>Streaming platform logos and data belong to their respective owners</li>
                  <li>We respect all third-party intellectual property rights</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                Service Availability & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Service Availability</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We strive to maintain high availability but cannot guarantee 100% uptime</li>
                  <li>Scheduled maintenance may temporarily interrupt service</li>
                  <li>We reserve the right to modify or discontinue features</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Disclaimers</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Content information accuracy depends on third-party sources</li>
                  <li>Streaming availability may change without notice</li>
                  <li>We are not responsible for external website content or services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Limitation of Liability</h3>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, BINGEBOARD SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE SERVICE.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Account Termination & Suspension</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Termination by You</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You may delete your account at any time through your profile settings</li>
                  <li>Account deletion will remove your personal data as outlined in our Privacy Policy</li>
                  <li>Some aggregated usage data may be retained for analytics purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Termination by Us</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We may suspend or terminate accounts that violate these Terms</li>
                  <li>Serious violations may result in immediate termination</li>
                  <li>We will provide notice when possible, except for serious violations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Subscription & Billing (Future)</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Premium Features</h3>
                <p>
                  BingeBoard may offer premium subscription features in the future. When available, 
                  billing terms and conditions will be clearly disclosed at the time of purchase.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Free Service</h3>
                <p>
                  Our current service is provided free of charge. We reserve the right to introduce 
                  premium features while maintaining core functionality at no cost.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Changes & Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Changes to Terms</h3>
                <p>
                  We may update these Terms from time to time. We will notify users of significant changes 
                  through email or in-app notifications. Continued use of the service after changes 
                  constitutes acceptance of the new Terms.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Governing Law</h3>
                <p>
                  These Terms are governed by and construed in accordance with the laws of the jurisdiction 
                  where BingeBoard operates, without regard to conflict of law principles.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Contact Information</h3>
                <p>
                  If you have questions about these Terms, please contact us at:
                </p>
                <ul className="list-none mt-2 space-y-1">
                  <li>Email: legal@bingeboard.com</li>
                  <li>Subject: Terms of Service Inquiry</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8 bg-gray-700" />
        
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            These Terms of Service are effective as of {new Date().toLocaleDateString()}
          </p>
          <Link href="/">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Return to BingeBoard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}