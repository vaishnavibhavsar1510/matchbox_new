import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>MatchBox - Meaningful Connections</title>
        <meta name="description" content="MatchBox - AI-powered dating app that creates meaningful connections" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="aurora-waves"></div>
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-aurora-dark mb-6">
            <span className="text-aurora-blue">Match</span>Box
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Discover meaningful connections through our AI-powered matching system
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/auth/signin" className="btn btn-primary w-full sm:w-auto inline-block">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn btn-secondary w-full sm:w-auto inline-block">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          <div className="card">
            <h3 className="text-xl font-semibold mb-3 text-aurora-blue">AI-Curated Match Circles</h3>
            <p>Join small groups of 5-8 highly compatible people matched by our advanced AI system.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-3 text-aurora-blue">Interest-Based Meetups</h3>
            <p>Attend weekly in-person events based on your shared interests with your Match Circle.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-3 text-aurora-blue">Digital Wingmate</h3>
            <p>Get help from our AI assistant to break the ice and prepare for meetups.</p>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-6 text-center text-aurora-dark">
        <p>© {new Date().getFullYear()} MatchBox. All rights reserved.</p>
      </footer>
    </div>
  );
} 