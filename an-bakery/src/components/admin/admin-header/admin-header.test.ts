import { describe, it, expect } from 'vitest';
import AdminHeader from './admin-header.vue';

describe('AdminHeader', () => {
    it('renders correctly', () => {
        const wrapper = mount(AdminHeader);
        expect(wrapper.exists()).toBe(true);
    });
    
    it('contains the correct title', () => {
        const wrapper = mount(AdminHeader);
        expect(wrapper.text()).toContain('Admin Header');
    });
});