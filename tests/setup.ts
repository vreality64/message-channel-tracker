// Silence noisy console during tests. Allow warnings and errors by default.
// Individual tests can spy/restore if they need to assert on logs.
const noop = () => {};

beforeAll(() => {
  vi.spyOn(console, "log").mockImplementation(noop);
  vi.spyOn(console, "info").mockImplementation(noop);
  vi.spyOn(console, "debug").mockImplementation(noop);
  vi.spyOn(console, "group").mockImplementation(noop);
  vi.spyOn(console, "groupCollapsed").mockImplementation(noop);
  vi.spyOn(console, "groupEnd").mockImplementation(noop);
});

afterAll(() => {
  vi.restoreAllMocks();
});
