import { renderHook, act } from '@testing-library/react';
import useToast from './useToast.js';

jest.useFakeTimers();

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
