import { config } from '@/config';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.backendUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (response.status === 401) {
        // Try to refresh token
        const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (refreshResponse.ok) {
          // Retry the original request
          const retryResponse = await fetch(url, defaultOptions);
          const data = await retryResponse.json();
          return { data };
        } else {
          // Don't redirect automatically - let the calling code handle it
          return { error: 'Unauthorized' };
        }
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        // Handle empty response body (like in confirm email)
        if (response.ok) {
          return { data: { message: 'Success' } as T };
        } else {
          return { error: 'Request failed' };
        }
      }
      
      if (!response.ok) {
        const errorData = data as { error?: string };
        return { error: errorData.error || 'Request failed' };
      }

      return { data: data as T };
    } catch {
      return { error: 'Network error' };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string, url: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, url }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  }

  async forgotPassword(email: string, url: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, url }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  async confirmEmail(token: string) {
    return this.request('/auth/confirm-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendConfirmation(email: string) {
    return this.request('/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Node endpoints
  async getNodes() {
    return this.request('/nodes/api');
  }

  async getSharedNodes() {
    return this.request('/nodes/api/shared');
  }

  async getNode(nodeId: string) {
    return this.request(`/nodes/api/${nodeId}`);
  }

  async createNode(subdomainName: string) {
    return this.request('/nodes/api', {
      method: 'POST',
      body: JSON.stringify({ subdomain_name: subdomainName }),
    });
  }

  async updateNode(nodeId: string, data: {
    subdomain_name?: string;
    display_name?: string;
    description?: string;
    background_color?: string;
    page_title?: string;
  }) {
    return this.request(`/nodes/api/${nodeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNode(nodeId: string) {
    return this.request(`/nodes/api/${nodeId}`, {
      method: 'DELETE',
    });
  }

  async transferOwnership(nodeId: string, newOwnerId: number) {
    return this.request(`/nodes/api/${nodeId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ new_owner_id: newOwnerId }),
    });
  }

  // Link endpoints
  async getLinks(nodeId: string) {
    return this.request(`/nodes/api/${nodeId}/links`);
  }

  async getLink(nodeId: string, linkId: string) {
    return this.request(`/nodes/api/${nodeId}/links/${linkId}`);
  }

  async createLink(nodeId: string, data: {
    display_name: string;
    link: string;
    name?: string;
    icon?: string;
    visible?: boolean;
    enabled?: boolean;
    mini?: boolean;
    gradient_type?: string;
    gradient_angle?: number;
    color_stops?: Array<{ color: string; position: number }>;
    custom_accent_color_enabled?: boolean;
    custom_accent_color?: string;
    custom_title_color_enabled?: boolean;
    custom_title_color?: string;
    custom_description_color_enabled?: boolean;
    custom_description_color?: string;
    mini_background_enabled?: boolean;
  }) {
    return this.request(`/nodes/api/${nodeId}/links`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLink(nodeId: string, linkId: string, data: {
    name?: string;
    display_name?: string;
    link?: string;
    icon?: string;
    visible?: boolean;
    enabled?: boolean;
    mini?: boolean;
    gradient_type?: string;
    gradient_angle?: number;
    color_stops?: Array<{ color: string; position: number }>;
    custom_accent_color_enabled?: boolean;
    custom_accent_color?: string;
    custom_title_color_enabled?: boolean;
    custom_title_color?: string;
    custom_description_color_enabled?: boolean;
    custom_description_color?: string;
    mini_background_enabled?: boolean;
  }) {
    return this.request(`/nodes/api/${nodeId}/links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLink(nodeId: string, linkId: string) {
    return this.request(`/nodes/api/${nodeId}/links/${linkId}`, {
      method: 'DELETE',
    });
  }

  async reorderLink(nodeId: string, linkId: string, newPosition: number) {
    return this.request(`/nodes/api/${nodeId}/links/${linkId}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ new_position: newPosition }),
    });
  }

  // Public endpoints (no auth required)
  async getPublicNode(nodeId: string) {
    return this.request(`/nodes/public/${nodeId}`, {
      credentials: 'omit', // Don't send cookies for public endpoints
    });
  }

  async getPublicLinks(nodeId: string) {
    return this.request(`/nodes/public/${nodeId}/links`, {
      credentials: 'omit', // Don't send cookies for public endpoints
    });
  }

  // Get node by subdomain (for public pages)
  async getNodeBySubdomain(subdomain: string) {
    return this.request(`/nodes/public/subdomain/${subdomain}`, {
      credentials: 'omit',
    });
  }

  // Get public links by subdomain
  async getPublicLinksBySubdomain(subdomain: string) {
    return this.request(`/nodes/public/subdomain/${subdomain}/links`, {
      credentials: 'omit',
    });
  }

  // Get node by name (for public pages)
  async getNodeByName(name: string) {
    return this.request(`/nodes/public/name/${name}`, {
      credentials: 'omit',
    });
  }

  // Get public links by name
  async getPublicLinksByName(name: string) {
    return this.request(`/nodes/public/name/${name}/links`, {
      credentials: 'omit',
    });
  }

  // Invite collaborator by email
  async inviteCollaborator(nodeId: string, email: string, baseUrl: string) {
    return this.request(`/nodes/api/${nodeId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, base_url: baseUrl }),
    });
  }

  // Get invitations for a node
  async getInvitations(nodeId: string) {
    return this.request(`/nodes/api/${nodeId}/invitations`);
  }

  // Get collaborators for a node
  async getCollaborators(nodeId: string) {
    return this.request(`/nodes/api/${nodeId}/collaborators`);
  }

  // Remove collaborator from node
  async removeCollaborator(nodeId: string, userId: string) {
    return this.request(`/nodes/api/${nodeId}/collaborators/${userId}`, {
      method: 'DELETE',
    });
  }

  // Accept invitation
  async acceptInvitation(token: string) {
    return this.request(`/nodes/api/acceptinvitation`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

}

export const apiClient = new ApiClient(); 