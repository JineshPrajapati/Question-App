import React from "react";
import {
  FileText,
  Book,
  Shield,
  ShieldCheck,
  Info,
  Check,
  Gavel,
  Handshake,
} from "lucide-react";

export function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 border-b pb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Terms and Conditions
        </h1>

        <div className="space-y-12 rounded-xl bg-white p-6 shadow-lg sm:p-10">
          {/* Section Template */}
          {[
            {
              id: "agreement",
              icon: Handshake,
              title: "Agreement to Terms",
              content: `By accessing and using this teacher platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services.`,
            },
            {
              id: "service",
              icon: Info,
              title: "Service Description",
              content: `Our platform connects qualified teachers with students seeking educational services. We facilitate the matching process but are not directly responsible for the teaching services provided.`,
            },
            {
              id: "responsibilities",
              icon: Check,
              title: "User Responsibilities",
              list: [
                "Provide accurate and truthful information during registration",
                "Maintain the confidentiality of your account credentials",
                "Comply with all applicable laws and regulations",
                "Respect the privacy and rights of other users",
                "Report any suspicious or inappropriate behavior",
              ],
            },
            {
              id: "teacher-terms",
              icon: Book,
              title: "Teacher-Specific Terms",
              list: [
                "Must maintain valid certifications and qualifications as required by applicable educational standards",
                "Provide accurate information about experience and credentials",
                "Maintain professional standards of teaching and conduct",
                "Comply with all relevant educational laws, regulations, and guidelines",
                "Ensure the safety and well-being of students under their care",
              ],
            },
            {
              id: "privacy",
              icon: Shield,
              title: "Privacy and Data Protection",
              content: `We are committed to protecting your privacy and personal information. Our data collection and processing practices are detailed in our Privacy Policy. By using our services, you consent to our data practices as described in the Privacy Policy.`,
            },
            {
              id: "liability",
              icon: ShieldCheck,
              title: "Liability Limitations",
              content: `While we strive to maintain a safe and reliable platform, we are not liable for:`,
              list: [
                "The quality of teaching services provided by teachers",
                "Disputes between teachers and students",
                "Any damages resulting from the use of our services",
                "Service interruptions or technical issues",
              ],
            },
            {
              id: "termination",
              icon: Gavel,
              title: "Termination",
              content: `We reserve the right to terminate or suspend accounts that violate these terms, engage in fraudulent activity, or pose a risk to other users.`,
            },
            {
              id: "changes",
              icon: FileText,
              title: "Changes to Terms",
              content: `We may modify these terms at any time. Continued use of our services after such changes constitutes acceptance of the new terms.`,
            },
          ].map((section) => (
            <section id={section.id} className="scroll-mt-24" key={section.id}>
              <div className="mb-3 flex text-left">
                <section.icon className="text-primary mr-3 h-6 w-6" />
                <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
                  {section.title}
                </h2>
              </div>
              {section.content && (
                <p className="text-left leading-relaxed text-gray-700">
                  {section.content}
                </p>
              )}
              {section.list && (
                <ul className="list-disc pl-8 text-left leading-relaxed text-gray-700">
                  {section.list.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <footer className="border-t pt-6 text-sm text-gray-600">
            <strong>Contact Information:</strong> For questions about these
            terms, please contact us at:
            <a
              href="mailto:info@simphonic.ai"
              className="text-primary ml-1 hover:underline"
            >
              info@simphonic.ai
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
