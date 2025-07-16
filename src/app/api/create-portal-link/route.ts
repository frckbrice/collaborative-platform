import { stripe } from '@/lib/stripe';
import { createOrRetrieveCustomer } from '@/lib/stripe/admin-tasks';
import { getURL } from '@/lib/utils';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies: cookies });
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not found! -- UNAUTHORIZED');
        }

        const customer = await createOrRetrieveCustomer({
            email: user?.email || '',
            uuid: user?.id || '',
        });

        if (!customer) {
            console.log('customer not found');
            throw new Error('Customer not found');
        }

        const { url } = await stripe.billingPortal.sessions.create({
            customer: customer,
            return_url: getURL() + 'dashboard',
        });

        return NextResponse.json({ url });
    } catch (error) {
        console.error(error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
