import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";

export default function Privacy() {
  return (
    <div className="dark min-h-screen bg-background text-foreground relative" style={{ background: "#080808" }}>
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl pt-24">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Introduction</h2>
            <p>
              This Privacy Policy explains how XMem ("we", "our", or "the extension") collects, uses, and protects your information when you use the XMem browser extension. We are committed to ensuring your privacy and data security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Data We Collect</h2>
            <p>To provide our services, the XMem extension collects and processes the following types of data:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong className="text-foreground">Authentication Information:</strong> We store your XMem API Key and User ID securely in your browser's local storage to authenticate requests to our backend API (<code className="bg-muted px-1 rounded">api.xmem.in</code>).
              </li>
              <li>
                <strong className="text-foreground">Personal Communications:</strong> The extension may read chat messages and interactions when you are actively using supported AI platforms (e.g., ChatGPT, Claude, Gemini) to provide real-time memory retrieval and context injection.
              </li>
              <li>
                <strong className="text-foreground">Website Content:</strong> When you use the "Save to XMem" context menu or similar features, we capture the specific text or content you select from the webpage to store in your personal memory graph.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. How We Use Your Data</h2>
            <p>Your data is used strictly for the single purpose of the extension: capturing, storing, and retrieving contextual information to build your persistent memory layer.</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>We transmit the collected data securely to our backend server (<code className="bg-muted px-1 rounded">api.xmem.in</code>) where it is indexed into your personal memory graph.</li>
              <li>We <strong>do not</strong> sell or transfer your data to third parties.</li>
              <li>We <strong>do not</strong> use or transfer your data for purposes unrelated to the core functionality of XMem.</li>
              <li>We <strong>do not</strong> use your data to determine creditworthiness or for lending purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Data Security & Storage</h2>
            <p>
              Your data is transmitted securely over HTTPS. Your API keys are kept in your browser's local storage and are only sent to our servers for authentication. The memories we index are stored securely in our databases, associated only with your unique user account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. User Control & Deletion</h2>
            <p>
              You maintain control over your data. You can delete your memory data or revoke the extension's access by uninstalling it and clearing your extension storage. You may also contact us to request the deletion of your account and associated data from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
