import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Eye, Lock, Database, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-32 md:pt-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-teal-400" />
                Your Privacy Matters
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                BingeBoard ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our entertainment tracking platform.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-teal-400" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and email address (from authentication providers)</li>
                  <li>Profile picture (optional, from authentication providers)</li>
                  <li>Viewing preferences and entertainment choices</li>
                  <li>Watchlist data and show ratings</li>
                  <li>Social connections and friend relationships</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information (type, operating system, browser)</li>
                  <li>App usage patterns and feature interactions</li>
                  <li>Search queries and content discovery behavior</li>
                  <li>Streaming platform integration data (when authorized)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Automatically Collected Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and general location information</li>
                  <li>Session data and authentication tokens</li>
                  <li>Error logs and performance metrics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-teal-400" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Core Services</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide personalized show recommendations</li>
                  <li>Maintain your watchlist and viewing history</li>
                  <li>Enable social features and friend connections</li>
                  <li>Sync data across devices and platforms</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Communication</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Send notifications about new episodes and releases</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Share important updates about our service</li>
                  <li>Respond to your questions and feedback</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Improvement & Analytics</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Analyze usage patterns to improve our service</li>
                  <li>Develop new features based on user behavior</li>
                  <li>Monitor and maintain system performance</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="w-5 h-5 mr-2 text-teal-400" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p className="font-semibold text-white">We do not sell your personal information to third parties.</p>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">We may share information in these cases:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Service Providers:</strong> Trusted partners who help operate our service</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Third-Party Services</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Authentication providers (Google, Replit Auth)</li>
                  <li>The Movie Database (TMDB) for content information</li>
                  <li>Cloud hosting and database services</li>
                  <li>Analytics and performance monitoring tools</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lock className="w-5 h-5 mr-2 text-teal-400" />
                Data Security & Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Security Measures</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>End-to-end encryption for data transmission</li>
                  <li>Secure authentication and session management</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access controls and monitoring</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Your Rights (CCPA & GDPR Compliance)</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Export your data in a readable format</li>
                  <li><strong>Opt-out:</strong> Withdraw consent for data processing</li>
                  <li><strong>Non-discrimination:</strong> Equal service regardless of privacy choices</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">California Consumer Privacy Act (CCPA)</h3>
                <p>
                  California residents have specific rights regarding their personal information. 
                  We do not sell personal information and provide clear disclosure of data collection practices.
                  You may exercise your rights by contacting us at privacy@bingeboard.com.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Data Retention & Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Retention</h3>
                <p>
                  We retain your data only as long as necessary to provide our services or as required by law. 
                  You can request deletion of your account and associated data at any time.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Children's Privacy</h3>
                <p>
                  Our service is not intended for children under 13. We do not knowingly collect personal 
                  information from children under 13. If we discover such information, we will delete it immediately.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Contact & Updates</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Contact Information</h3>
                <p>
                  For privacy-related questions or to exercise your rights, contact us at:
                </p>
                <ul className="list-none mt-2 space-y-1">
                  <li>Email: privacy@bingeboard.com</li>
                  <li>Subject: Privacy Policy Inquiry</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Policy Updates</h3>
                <p>
                  We may update this Privacy Policy periodically. We will notify you of significant changes 
                  through email or app notifications. Your continued use constitutes acceptance of the updated policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8 bg-gray-700" />
        
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            This Privacy Policy is effective as of {new Date().toLocaleDateString()}
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