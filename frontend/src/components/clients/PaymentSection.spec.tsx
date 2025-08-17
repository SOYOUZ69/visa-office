import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PaymentSection } from './PaymentSection';
import { useAuth } from '@/contexts/AuthContext';
import { paymentsAPI, metaAPI, servicesAPI } from '@/lib/api';

// Mock the dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/lib/api');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockPaymentsAPI = paymentsAPI as jest.Mocked<typeof paymentsAPI>;
const mockMetaAPI = metaAPI as jest.Mocked<typeof metaAPI>;
const mockServicesAPI = servicesAPI as jest.Mocked<typeof servicesAPI>;

describe('PaymentSection', () => {
  const mockAdminUser = {
    id: '1',
    email: 'admin@test.com',
    role: 'ADMIN' as const,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockUser = {
    id: '2',
    email: 'user@test.com',
    role: 'USER' as const,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockPayment = {
    id: 'payment-1',
    clientId: 'client-1',
    totalAmount: '400.00',
    paymentOption: 'BANK_TRANSFER' as const,
    paymentModality: 'SIXTY_FORTY' as const,
    transferCode: 'TRF123',
    installments: [
      {
        id: 'installment-1',
        description: 'First Payment - 60%',
        percentage: '60.00',
        amount: '240.00',
        dueDate: '2024-12-31T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'installment-2',
        description: 'Second Payment - 40%',
        percentage: '40.00',
        amount: '160.00',
        dueDate: '2025-01-31T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockServices = [
    {
      id: 'service-1',
      clientId: 'client-1',
      serviceType: 'TRANSLATION',
      quantity: 2,
      unitPrice: '200.00',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    mockMetaAPI.getPaymentOptions.mockResolvedValue(['BANK_TRANSFER', 'CHEQUE', 'POST', 'CASH']);
    mockMetaAPI.getPaymentModalities.mockResolvedValue(['FULL_PAYMENT', 'SIXTY_FORTY', 'MILESTONE_PAYMENTS']);
    mockServicesAPI.getClientServices.mockResolvedValue(mockServices);
  });

  describe('New Client Mode', () => {
    it('should show informative message for new clients', () => {
      render(<PaymentSection isNewClient={true} />);

      expect(screen.getByText('Payment options will be available after the client is created and services are added')).toBeInTheDocument();
      expect(screen.getByText('Please save the client and add services first')).toBeInTheDocument();
    });
  });

  describe('Client with No Services', () => {
    beforeEach(() => {
      mockServicesAPI.getClientServices.mockResolvedValue([]);
      mockPaymentsAPI.getClientPayments.mockResolvedValue([]);
    });

    it('should show message when no services exist', async () => {
      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Add services first to configure payment options')).toBeInTheDocument();
        expect(screen.getByText('No services found. Please add services to configure payments.')).toBeInTheDocument();
      });
    });
  });

  describe('Client with Services but No Payments', () => {
    beforeEach(() => {
      mockPaymentsAPI.getClientPayments.mockResolvedValue([]);
    });

    it('should show payment configuration form when no payments exist', async () => {
      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Total of Services:')).toBeInTheDocument();
        expect(screen.getByText('$400.00')).toBeInTheDocument();
        expect(screen.getByText('Payment Option')).toBeInTheDocument();
        expect(screen.getByText('Payment Modality')).toBeInTheDocument();
        expect(screen.getByText('Save Payment')).toBeInTheDocument();
      });
    });

    it('should not show payment history when no payments exist', async () => {
      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        expect(screen.queryByText('Payment History')).not.toBeInTheDocument();
      });
    });
  });

  describe('Client with Existing Payments', () => {
    beforeEach(() => {
      mockPaymentsAPI.getClientPayments.mockResolvedValue([mockPayment]);
    });

    it('should show payment history and hide configuration form when payments exist', async () => {
      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Payment History')).toBeInTheDocument();
        expect(screen.getByText('Bank Transfer - 60% - 40%')).toBeInTheDocument();
        expect(screen.getByText('Total: $400.00')).toBeInTheDocument();
        expect(screen.queryByText('Payment Option')).not.toBeInTheDocument();
        expect(screen.queryByText('Save Payment')).not.toBeInTheDocument();
      });
    });

    it('should show edit and delete buttons for admin users', async () => {
      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        expect(editButton).toBeInTheDocument();
        expect(deleteButton).toBeInTheDocument();
      });
    });

    it('should not show edit and delete buttons for regular users', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockPaymentsAPI.getClientPayments.mockResolvedValue([mockPayment]);
    });

    it('should show configuration form when edit button is clicked', async () => {
      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Edit Payment Configuration')).toBeInTheDocument();
        expect(screen.getByText('Payment Option')).toBeInTheDocument();
        expect(screen.getByText('Payment Modality')).toBeInTheDocument();
        expect(screen.getByText('Update Payment')).toBeInTheDocument();
        expect(screen.getByText('Cancel Edit')).toBeInTheDocument();
      });
    });

    it('should pre-fill form with existing payment data', async () => {
      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        // Check that the form is pre-filled with existing data
        expect(screen.getByDisplayValue('TRF123')).toBeInTheDocument(); // Transfer code
        expect(screen.getByText('First Payment - 60%')).toBeInTheDocument(); // Description
        expect(screen.getByText('Second Payment - 40%')).toBeInTheDocument(); // Description
      });
    });

    it('should return to history view when cancel edit is clicked', async () => {
      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel Edit');
        fireEvent.click(cancelButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Edit Payment Configuration')).not.toBeInTheDocument();
        expect(screen.getByText('Payment History')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Payment', () => {
    beforeEach(() => {
      mockPaymentsAPI.getClientPayments.mockResolvedValue([mockPayment]);
      mockPaymentsAPI.deletePayment.mockResolvedValue(undefined);
      global.confirm = vi.fn(() => true);
    });

    it('should delete payment and show configuration form', async () => {
      render(<PaymentSection clientId="client-1" />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(mockPaymentsAPI.deletePayment).toHaveBeenCalledWith('payment-1');
        expect(screen.getByText('Payment Option')).toBeInTheDocument();
        expect(screen.getByText('Save Payment')).toBeInTheDocument();
      });
    });
  });
});
