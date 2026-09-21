import { AuthService } from '../services/authService';
import { EntitlementService } from '../services/entitlementService';
import { IapService } from '../services/iapService';
import { ProgressService } from '../services/progressService';
import { createServices } from './services';

describe('createServices', () => {
  it('wires the full set of production services', () => {
    const services = createServices();
    expect(services.auth).toBeInstanceOf(AuthService);
    expect(services.entitlements).toBeInstanceOf(EntitlementService);
    expect(services.progress).toBeInstanceOf(ProgressService);
    expect(services.iap).toBeInstanceOf(IapService);
  });
});
