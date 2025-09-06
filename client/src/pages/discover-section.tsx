import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { useRoute } from 'wouter';

export default function DiscoverSectionPage() {
    const [, params] = useRoute('/discover/:section');
    const section = params?.section || 'recommended';

    return (
        <AppLayout>
            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <h1 className="text-2xl font-bold text-white capitalize">{section.replace('-', ' ')}</h1>
                    <p className="text-gray-300 mt-2">This is a placeholder page for “{section}”. We’ll wire real data next.</p>
                </div>
            </main>
        </AppLayout>
    );
}
