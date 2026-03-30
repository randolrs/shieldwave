/**
 * Returns Express middleware that validates req.body against a Zod schema.
 * On failure, responds with 400 and the formatted Zod error issues.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: result.error.issues,
      });
    }

    // Replace req.body with the parsed (and potentially transformed) data
    req.body = result.data;
    next();
  };
}
