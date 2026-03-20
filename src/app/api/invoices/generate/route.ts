import { NextRequest, NextResponse } from 'next/server';
import { generateInvoice, sendInvoiceEmail } from '@/lib/stripe/invoices';

interface GenerateInvoiceBody {
  readonly customerId: string;
  readonly recipientEmail: string;
  readonly recipientName: string;
  readonly items: ReadonlyArray<{
    readonly description: string;
    readonly amount: number;
    readonly quantity: number;
  }>;
  readonly dueDate?: string; // ISO date string
  readonly sendEmail?: boolean;
  readonly metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateInvoiceBody;

    if (!body.customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one line item is required' },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      if (!item.description || item.amount <= 0 || item.quantity <= 0) {
        return NextResponse.json(
          { success: false, error: 'Each item must have a description, positive amount, and positive quantity' },
          { status: 400 }
        );
      }
    }

    const dueDate = body.dueDate ? new Date(body.dueDate) : undefined;

    const invoice = await generateInvoice({
      customerId: body.customerId,
      items: body.items,
      dueDate,
      metadata: body.metadata,
    });

    if (body.sendEmail !== false && body.recipientEmail) {
      await sendInvoiceEmail({
        invoiceId: invoice.id,
        recipientEmail: body.recipientEmail,
        recipientName: body.recipientName,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        status: invoice.status,
        amountDue: invoice.amount_due,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate invoice';
    console.error('[API] Generate invoice error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
