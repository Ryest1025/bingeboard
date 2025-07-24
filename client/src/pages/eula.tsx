import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Smartphone, Download, Shield, AlertCircle, Zap } from "lucide-react";

export default function EULA() {
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
          <h1 className="text-3xl font-bold text-white mb-2">End User License Agreement (EULA)</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-teal-400" />
                Software License Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                This End User License Agreement ("EULA") is a legal agreement between you and BingeBoard for the 
                BingeBoard mobile application and web platform ("Software"). By installing, copying, or using the Software, 
                you agree to be bound by this EULA.
              </p>
              <p className="font-semibold text-white">
                IF YOU DO NOT AGREE TO THE TERMS OF THIS EULA, DO NOT INSTALL OR USE THE SOFTWARE.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Download className="w-5 h-5 mr-2 text-teal-400" />
                License Grant
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Permitted Use</h3>
                <p>
                  Subject to the terms of this EULA, BingeBoard grants you a limited, non-exclusive, non-transferable, 
                  revocable license to use the Software on your personal devices for your personal, non-commercial use.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Installation Rights</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Install the mobile app on devices you own or control</li>
                  <li>Access the web platform through supported browsers</li>
                  <li>Create one account per person for personal use</li>
                  <li>Sync data across your authorized devices</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Restrictions</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Do not reverse engineer, decompile, or disassemble the Software</li>
                  <li>Do not distribute, rent, lease, or sublicense the Software</li>
                  <li>Do not remove or modify copyright notices or proprietary marks</li>
                  <li>Do not use the Software for commercial purposes without permission</li>
                  <li>Do not create derivative works based on the Software</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-teal-400" />
                Device Permissions & Data Access
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Required Permissions</h3>
                <p className="mb-3">
                  The BingeBoard mobile app requests the following device permissions to provide core functionality:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Internet Access:</strong> Required to sync your watchlist and fetch show information</li>
                  <li><strong>Storage Access:</strong> Store app settings and cache content for offline viewing</li>
                  <li><strong>Notification Access:</strong> Send alerts about new episodes and releases (optional)</li>
                  <li><strong>Camera/Photos (iOS):</strong> Upload profile pictures (optional, with your permission)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Consent & Control</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We request explicit permission before accessing sensitive device features</li>
                  <li>You can revoke permissions through your device settings at any time</li>
                  <li>Core features work without optional permissions like camera access</li>
                  <li>Location data is not collected or used by our app</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Security</h3>
                <p>
                  All data transmitted between your device and our servers is encrypted using industry-standard protocols. 
                  We implement appropriate technical and organizational measures to protect your personal information.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-teal-400" />
                Privacy & Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Privacy Protection</h3>
                <p>
                  Your privacy is protected under our Privacy Policy, which is incorporated by reference into this EULA. 
                  We collect only the minimum data necessary to provide our services.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Third-Party Integrations</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Authentication through Google and Replit (with your consent)</li>
                  <li>Show data from The Movie Database (TMDB)</li>
                  <li>Streaming platform integration (when you authorize access)</li>
                  <li>Analytics services for app improvement (anonymized data only)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">California Consumer Privacy Act (CCPA) Rights</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to delete your personal information</li>
                  <li>Right to opt-out of the sale of personal information (we don't sell data)</li>
                  <li>Right to non-discrimination for exercising your privacy rights</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-400" />
                Disclaimers & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Software Warranty</h3>
                <p className="uppercase font-semibold text-white mb-2">
                  THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
                </p>
                <p>
                  We disclaim all warranties, express or implied, including but not limited to warranties of 
                  merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Content Accuracy</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Show information depends on third-party data sources</li>
                  <li>Streaming availability may change without notice</li>
                  <li>We are not responsible for external service interruptions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Limitation of Liability</h3>
                <p className="uppercase font-semibold text-white mb-2">
                  IN NO EVENT SHALL BINGEBOARD BE LIABLE FOR ANY CONSEQUENTIAL, INCIDENTAL, OR INDIRECT DAMAGES.
                </p>
                <p>
                  Our total liability to you for any damages shall not exceed the amount you paid for the Software 
                  in the twelve months preceding the claim.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Updates & Termination</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Software Updates</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We may provide updates to improve functionality and security</li>
                  <li>Updates may be installed automatically on mobile devices</li>
                  <li>Some updates may require acceptance of modified terms</li>
                  <li>You can disable automatic updates in your device settings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">License Termination</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>This license is effective until terminated</li>
                  <li>You may terminate by deleting the Software and your account</li>
                  <li>We may terminate if you violate this EULA</li>
                  <li>Upon termination, you must cease all use of the Software</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Effect of Termination</h3>
                <p>
                  Upon termination, your right to use the Software ceases immediately. Your data will be handled 
                  according to our Privacy Policy data retention and deletion procedures.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Legal & Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Governing Law</h3>
                <p>
                  This EULA is governed by applicable laws without regard to conflict of law principles. 
                  Any disputes will be resolved through binding arbitration where permitted by law.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Severability</h3>
                <p>
                  If any provision of this EULA is found to be unenforceable, the remainder shall continue 
                  in full force and effect.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Contact Information</h3>
                <p>
                  For questions about this EULA, contact us at:
                </p>
                <ul className="list-none mt-2 space-y-1">
                  <li>Email: legal@bingeboard.com</li>
                  <li>Subject: EULA Inquiry</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8 bg-gray-700" />
        
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            This End User License Agreement is effective as of {new Date().toLocaleDateString()}
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