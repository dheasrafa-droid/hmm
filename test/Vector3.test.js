import { createVector3 } from '../Vector3.js'; // 
test('mutation triggers dirty flag', () => {
  const v = createVector3(1, 2, 3);
  v.setX(5);
  expect(v.isDirty).toBe(true);
});

test('observer hook fires on change', () => {
  const v = createVector3();
  const spy = jest.fn();
  v.onChange = spy;
  v.setY(10);
  expect(spy).toHaveBeenCalledWith(v);
});
