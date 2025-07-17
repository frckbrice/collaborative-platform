import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full border-t bg-background py-12 mt-16">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-foreground">av-digital-workspaces Inc.</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Empowering teams to collaborate in real-time, boost productivity, and stay connected—wherever you are.
                    </p>
                    <div className="mt-4 flex space-x-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Facebook size={20} />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Twitter size={20} />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Instagram size={20} />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Linkedin size={20} />
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
                    <nav className="mt-2 flex flex-col space-y-2">
                        <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
                        <Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link>
                        <Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link>
                        <Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link>
                    </nav>
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-foreground">Legal</h3>
                    <nav className="mt-2 flex flex-col space-y-2">
                        <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of Service</Link>
                    </nav>
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                        <p>123 Scalom Ave, Suite 456</p>
                        <p>Yaoundé, Cameroon</p>
                        <p className="mt-2">
                            <a href="mailto:av-digital-workspaces2017@gmail.com" className="hover:text-primary">contact@av-digital-workspaces.com</a>
                        </p>
                        <p>
                            <a href="tel:+237674852304" className="hover:text-primary">+237 6 74 85 23 04</a>
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 mt-8 border-t pt-8 flex justify-center items-center">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} av-digital-workspaces Inc. All rights reserved.</p>
            </div>
        </footer>
    );
}
