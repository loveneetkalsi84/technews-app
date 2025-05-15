"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMail } from "react-icons/fi";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    try {
      // Here you would typically send the email to your API
      // const response = await fetch("/api/subscribe", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });
      
      // For now, we'll just simulate a successful subscription
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      console.error("Failed to subscribe:", error);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Social Links */}
          <div className="col-span-1">
            <Link href="/" className="text-2xl font-bold text-blue-400 mb-4 block">
              TechNews
            </Link>
            <p className="text-gray-400 mb-6">
              Your source for the latest tech news, reviews, and insights.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-blue-400"
              >
                <FaFacebook size={22} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-gray-400 hover:text-blue-400"
              >
                <FaTwitter size={22} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-blue-400"
              >
                <FaInstagram size={22} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-gray-400 hover:text-blue-400"
              >
                <FaYoutube size={22} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-blue-400"
              >
                <FaLinkedin size={22} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/news" className="text-gray-400 hover:text-blue-400">
                  News
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-400 hover:text-blue-400">
                  Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/smartphones"
                  className="text-gray-400 hover:text-blue-400"
                >
                  Smartphones
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/laptops"
                  className="text-gray-400 hover:text-blue-400"
                >
                  Laptops
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/gaming"
                  className="text-gray-400 hover:text-blue-400"
                >
                  Gaming
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/ai"
                  className="text-gray-400 hover:text-blue-400"
                >
                  AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-blue-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-blue-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-blue-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="text-gray-400 hover:text-blue-400"
                >
                  Advertise
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest tech updates and news.
            </p>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMail className="text-gray-500" />
                  </div>
                  <input
                    type="email"
                    className="block w-full pl-10 pr-4 py-2 border-gray-600 rounded-l-md bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-md"
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <p className="text-green-400">
                Thanks for subscribing! Check your email for confirmation.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} TechNews. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-blue-400 text-sm mx-3">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-blue-400 text-sm mx-3">
                Terms
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-blue-400 text-sm mx-3">
                Sitemap
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-blue-400 text-sm mx-3">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
