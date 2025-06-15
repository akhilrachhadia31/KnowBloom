// src/pages/Contact.jsx
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

const Contact = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
      Contact Us
    </h1>

    <div className="flex flex-col sm:flex-row sm:space-x-12 space-y-6 sm:space-y-0">
      <div className="flex-1 space-y-4">
        <div className="flex items-center space-x-3">
          <Phone className="h-5 w-5 text-cyan-600" />
          <span>+1 (555) 123-4567</span>
        </div>
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-cyan-600" />
          <span>knowbloom.team@gmail.com</span>
        </div>
        <div className="flex items-center space-x-3">
          <MapPin className="h-5 w-5 text-cyan-600" />
          <span>123 Learning St., Mumbai, India</span>
        </div>

        <div className="flex space-x-4 pt-4">
          <a href="#" aria-label="Twitter">
            <Twitter className="h-6 w-6 text-gray-500 hover:text-cyan-600" />
          </a>
          <a href="#" aria-label="LinkedIn">
            <Linkedin className="h-6 w-6 text-gray-500 hover:text-cyan-600" />
          </a>
          <a href="#" aria-label="Instagram">
            <Instagram className="h-6 w-6 text-gray-500 hover:text-cyan-600" />
          </a>
        </div>
      </div>

      <form className="flex-1 space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            rows="4"
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-cyan-500"
          ></textarea>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
        >
          Send Message
        </button>
      </form>
    </div>
  </div>
);

export default Contact;
