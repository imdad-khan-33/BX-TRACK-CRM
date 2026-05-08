import { renderHook, act } from '@testing-library/react';
import { useUIStore } from '@store/uiStore';

describe('UIStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useUIStore());
    act(() => {
      result.current.clearMessages();
    });
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(null);
    expect(result.current.sidebarOpen).toBe(true);
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should set error message', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');
  });

  it('should set success message', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setSuccess('Success!');
    });

    expect(result.current.success).toBe('Success!');
  });

  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useUIStore());

    const initialState = result.current.sidebarOpen;

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(!initialState);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(initialState);
  });

  it('should set sidebar open state', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setSidebarOpen(false);
    });

    expect(result.current.sidebarOpen).toBe(false);

    act(() => {
      result.current.setSidebarOpen(true);
    });

    expect(result.current.sidebarOpen).toBe(true);
  });

  it('should clear messages', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setError('Test error');
      result.current.setSuccess('Success!');
    });

    expect(result.current.error).toBe('Test error');
    expect(result.current.success).toBe('Success!');

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(null);
  });
});
