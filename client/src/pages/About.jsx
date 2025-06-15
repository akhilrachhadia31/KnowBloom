// src/pages/About.jsx
import React from "react";

const About = () => (
  <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto px-4 py-12">
    <h1>About KnowBloom</h1>
    <p>
      KnowBloom is a hands-on learning platform dedicated to helping developers
      and professionals worldwide gain in-demand skills through project-based
      courses and real-world challenges.
    </p>

    <h2>Our Mission</h2>
    <p>
      To empower every learner—no matter where they are—with accessible,
      industry-relevant training that leads to tangible career outcomes.
    </p>

    <h2>Our Vision</h2>
    <p>
      A world where practical, skills-first education removes barriers to
      opportunity and unlocks human potential.
    </p>

    <h2>Core Values</h2>
    <ul>
      <li>
        <strong>Practicality:</strong> We focus on real projects, not just
        theory.
      </li>
      <li>
        <strong>Accessibility:</strong> Quality education should be open to all.
      </li>
      <li>
        <strong>Community:</strong> Learners thrive when they can share and
        collaborate.
      </li>
      <li>
        <strong>Excellence:</strong> We constantly iterate to deliver the best
        experience.
      </li>
    </ul>

    <h2>Meet the Team</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="space-y-2 text-center">
        <img
          src="/team/alice.jpg"
          alt="Alice"
          className="mx-auto h-24 w-24 rounded-full object-cover"
        />
        <p className="font-semibold">Alice Kumar</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          CEO &amp; Co-Founder
        </p>
      </div>
      <div className="space-y-2 text-center">
        <img
          src="/team/bob.jpg"
          alt="Bob"
          className="mx-auto h-24 w-24 rounded-full object-cover"
        />
        <p className="font-semibold">Bob Singh</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          CTO &amp; Co-Founder
        </p>
      </div>
      <div className="space-y-2 text-center">
        <img
          src="/team/charlie.jpg"
          alt="Charlie"
          className="mx-auto h-24 w-24 rounded-full object-cover"
        />
        <p className="font-semibold">Charlie Sharma</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Head of Content
        </p>
      </div>
    </div>
  </div>
);

export default About;
