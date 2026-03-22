/** True when the user came from demo/simulation login (no real JWT / auth.uid()). */
export function isSimulationDemoUser(
  user: { id?: string } | null | undefined
): boolean {
  return Boolean(user?.id?.startsWith("demo-"));
}
