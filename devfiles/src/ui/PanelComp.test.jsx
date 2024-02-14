import { test, expect } from 'vitest';

//Don't test anything with useState in it. React really doesn't like it.
test('placeholder', () => {
    expect(1).toBe(1);
});
