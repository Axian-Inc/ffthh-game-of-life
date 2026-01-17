import { renderHook, act } from '@testing-library/react';
import useToast from './useToast.js';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllTimers();
});

test('toast displays and auto-dismisses', () => {
  const { result } = renderHook(() => useToast());

  act(() => {
    result.current.addToast('Hello', 'success', 3000);
  });

  expect(result.current.toasts).toHaveLength(1);

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(result.current.toasts).toHaveLength(0);
});

test('manual dismiss clears timer', () => {
  const { result } = renderHook(() => useToast());

  let toastId;
  act(() => {
    toastId = result.current.addToast('Hello', 'info', 5000);
  });

  expect(result.current.toasts).toHaveLength(1);
  expect(jest.getTimerCount()).toBe(1);

  act(() => {
    result.current.removeToast(toastId);
  });

  expect(result.current.toasts).toHaveLength(0);
  expect(jest.getTimerCount()).toBe(0);
});

test('toast without duration does not create a timer', () => {
  const { result } = renderHook(() => useToast());

  act(() => {
    result.current.addToast('Persistent', 'info', 0);
  });

  expect(result.current.toasts).toHaveLength(1);
  expect(jest.getTimerCount()).toBe(0);
});

test('cleans up timers on unmount', () => {
  const { result, unmount } = renderHook(() => useToast());

  act(() => {
    result.current.addToast('One', 'info', 5000);
    result.current.addToast('Two', 'info', 4000);
  });

  expect(jest.getTimerCount()).toBe(2);

  unmount();

  expect(jest.getTimerCount()).toBe(0);
});
