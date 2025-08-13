import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServicesSection } from './ServicesSection';
import { AuthProvider } from '@/contexts/AuthContext';
import { servicesAPI, metaAPI } from '@/lib/api';

// Mock the API modules
jest.mock('@/lib/api', () => ({
  servicesAPI: {
    getClientServices: jest.fn(),
    createService: jest.fn(),
    createManyServices: jest.fn(),
    updateService: jest.fn(),
    deleteService: jest.fn(),
  },
  metaAPI: {
    getServiceTypes: jest.fn(),
  },
}));

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockServicesAPI = servicesAPI as jest.Mocked<typeof servicesAPI>;
const mockMetaAPI = metaAPI as jest.Mocked<typeof metaAPI>;

const mockServices = [
  {
    id: 'service-1',
    clientId: 'client-1',
    serviceType: 'Translation',
    quantity: 2,
    unitPrice: '50.00',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const mockServiceTypes = [
  'Translation',
  'Dossier Treatment',
  'Assurance',
  'Visa Application',
  'Consultation',
  'Other',
];

const renderWithAuth = (component: React.ReactElement, userRole: 'ADMIN' | 'USER' = 'ADMIN') => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: userRole,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('ServicesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockServicesAPI.getClientServices.mockResolvedValue(mockServices);
    mockMetaAPI.getServiceTypes.mockResolvedValue(mockServiceTypes);
  });

  it('renders services section with loading state initially', () => {
    renderWithAuth(<ServicesSection clientId="client-1" />);
    
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Loading services...')).toBeInTheDocument();
  });

  it('renders services section with data after loading', async () => {
    renderWithAuth(<ServicesSection clientId="client-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage services for this client')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Add New Services')).toBeInTheDocument();
    expect(screen.getByText('Existing Services')).toBeInTheDocument();
    expect(screen.getByText('Translation')).toBeInTheDocument();
  });

  it('shows add service controls for admin users', async () => {
    renderWithAuth(<ServicesSection clientId="client-1" />, 'ADMIN');
    
    await waitFor(() => {
      expect(screen.getByText('Add Service Row')).toBeInTheDocument();
    });
  });

  it('hides add service controls for user role', async () => {
    renderWithAuth(<ServicesSection clientId="client-1" />, 'USER');
    
    await waitFor(() => {
      expect(screen.queryByText('Add Service Row')).not.toBeInTheDocument();
    });
  });

  it('adds a new service row when Add Service Row is clicked', async () => {
    renderWithAuth(<ServicesSection clientId="client-1" />, 'ADMIN');
    
    await waitFor(() => {
      expect(screen.getByText('Add Service Row')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Add Service Row'));
    
    // Should show the new row with form fields
    expect(screen.getByPlaceholderText('Service Type')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Qty')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Unit Price')).toBeInTheDocument();
  });

  it('shows service types in dropdown', async () => {
    renderWithAuth(<ServicesSection clientId="client-1" />, 'ADMIN');
    
    await waitFor(() => {
      expect(screen.getByText('Add Service Row')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Add Service Row'));
    
    // Click on the service type dropdown
    const serviceTypeSelect = screen.getByPlaceholderText('Service Type');
    fireEvent.click(serviceTypeSelect);
    
    // Check that service types are available
    await waitFor(() => {
      expect(screen.getByText('Translation')).toBeInTheDocument();
      expect(screen.getByText('Dossier Treatment')).toBeInTheDocument();
      expect(screen.getByText('Assurance')).toBeInTheDocument();
    });
  });

  it('calculates subtotal correctly', async () => {
    renderWithAuth(<ServicesSection clientId="client-1" />, 'ADMIN');
    
    await waitFor(() => {
      expect(screen.getByText('Add Service Row')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Add Service Row'));
    
    // Fill in the form
    const quantityInput = screen.getByPlaceholderText('Qty');
    const unitPriceInput = screen.getByPlaceholderText('Unit Price');
    
    fireEvent.change(quantityInput, { target: { value: '3' } });
    fireEvent.change(unitPriceInput, { target: { value: '25.50' } });
    
    // Check that subtotal is calculated (3 * 25.50 = 76.50)
    await waitFor(() => {
      const subtotalInput = screen.getByDisplayValue('76.50');
      expect(subtotalInput).toBeInTheDocument();
    });
  });

  it('shows existing services in table', async () => {
    renderWithAuth(<ServicesSection clientId="client-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Translation')).toBeInTheDocument();
    });
    
    // Check table headers
    expect(screen.getByText('Service Type')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Unit Price')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    
    // Check service data
    expect(screen.getByText('2')).toBeInTheDocument(); // quantity
    expect(screen.getByText('$50.00')).toBeInTheDocument(); // unit price
    expect(screen.getByText('$100.00')).toBeInTheDocument(); // subtotal (2 * 50)
  });

  it('shows delete button for admin users in existing services', async () => {
    renderWithAuth(<ServicesSection clientId="client-1" />, 'ADMIN');
    
    await waitFor(() => {
      expect(screen.getByText('Translation')).toBeInTheDocument();
    });
    
    // Should show delete button for admin
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg')?.getAttribute('data-lucide') === 'trash-2'
    );
    expect(deleteButton).toBeInTheDocument();
  });

  it('hides delete button for user role in existing services', async () => {
    renderWithAuth(<ServicesSection clientId="client-1" />, 'USER');
    
    await waitFor(() => {
      expect(screen.getByText('Translation')).toBeInTheDocument();
    });
    
    // Should not show delete button for user
    const deleteButtons = screen.queryAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg')?.getAttribute('data-lucide') === 'trash-2'
    );
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('shows empty state when no services exist', async () => {
    mockServicesAPI.getClientServices.mockResolvedValue([]);
    
    renderWithAuth(<ServicesSection clientId="client-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('No services added yet.')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockServicesAPI.getClientServices.mockRejectedValue(new Error('API Error'));
    
    renderWithAuth(<ServicesSection clientId="client-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Services')).toBeInTheDocument();
    });
    
    // Should still render the component even with API errors
    expect(screen.getByText('Add New Services')).toBeInTheDocument();
  });
});
