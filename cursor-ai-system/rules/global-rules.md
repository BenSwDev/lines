# Global Rules for All AI Agents

## Purpose
Core rules that ALL agents in the Cursor AI System must follow, regardless of their specific purpose.

## Best Practices (Always Follow)

All agents must adhere to these best practices:

### Architecture
- Follow project's architectural patterns
- Respect module boundaries
- Maintain separation of concerns
- Use appropriate design patterns

### Security
- Never expose sensitive information
- Follow security best practices
- Validate all inputs
- Use secure defaults

### Performance
- Consider performance implications
- Optimize when appropriate
- Don't sacrifice readability for micro-optimizations
- Profile before optimizing

### Readability
- Write clear, self-documenting code
- Use meaningful names
- Add comments when needed
- Keep functions focused

### Maintainability
- Follow DRY principles
- Keep functions small and focused
- Use consistent patterns
- Document complex logic

### Modularity
- Create reusable components
- Minimize coupling
- Maximize cohesion
- Use proper abstractions

### Documentation
- Keep docs up-to-date
- Document decisions
- Explain "why" not just "what"
- Use clear, concise language

### DevOps Standards
- Follow CI/CD best practices
- Use proper environment management
- Implement proper error handling
- Monitor and log appropriately

### UI/UX Standards
- Follow design system
- Ensure accessibility
- Provide clear feedback
- Maintain consistency

## Review Output Requirements

All reviews must produce:

1. **Summary**
   - Brief overview of findings
   - Key metrics or statistics
   - Overall assessment

2. **List of Issues**
   - Detailed list of problems found
   - Prioritized by severity
   - Include file:line references

3. **List of Suggested Fixes**
   - Specific recommendations
   - Code examples when applicable
   - Migration paths for large changes

4. **Auto-fix Patches** (when possible)
   - Ready-to-apply code changes
   - Safe, tested modifications
   - Clearly marked as auto-fixable

5. **Updated Documentation** (when relevant)
   - Documentation updates
   - Architecture changes
   - API documentation

## Core Principles

### Preserve Business Logic
- **NEVER** change business logic without explicit approval
- Understand intent before suggesting changes
- Maintain existing functionality
- Test changes before suggesting

### Language Agnostic
- Work with any programming language
- Adapt analysis to language-specific patterns
- Use appropriate tools for each language
- Respect language conventions

### Unified Reporting
- All results merge into final report
- Use consistent format
- Categorize by priority
- Provide actionable insights

## Approval Workflow

1. **Always ask before applying changes**
   - Present findings first
   - Show patches
   - Request explicit approval

2. **Provide context**
   - Explain why change is needed
   - Show impact
   - Provide alternatives if applicable

3. **Incremental changes**
   - Apply fixes in logical groups
   - Test after each group
   - Allow rollback if needed

## Quality Standards

### Code Quality
- Follow project style guide
- Maintain test coverage
- Ensure type safety
- Handle errors properly

### Documentation Quality
- Keep documentation current
- Use clear language
- Include examples
- Maintain consistency

### Process Quality
- Document decisions
- Track changes
- Review before merging
- Test thoroughly

## Error Handling

- **Never fail silently**
- Log errors appropriately
- Provide helpful error messages
- Suggest fixes when possible

## Performance Considerations

- Consider impact of changes
- Profile when needed
- Optimize bottlenecks
- Don't over-optimize

## Security Considerations

- Never expose secrets
- Validate inputs
- Use secure defaults
- Follow OWASP guidelines

## Accessibility Considerations

- Follow WCAG guidelines
- Ensure keyboard navigation
- Use semantic HTML
- Support screen readers

## Localization Considerations

- Support multiple languages
- Handle RTL/LTR properly
- Use translation keys
- Test with different locales

## Maintenance Notes

- Keep rules updated
- Document exceptions
- Review rules periodically
- Align with project evolution

## Enforcement

These rules are enforced by:
- Master AI Quality Controller
- Individual agent prompts
- Code review process
- Documentation standards

## Exceptions

Exceptions to these rules must be:
- Documented with rationale
- Approved by project maintainers
- Reviewed periodically
- Justified by specific needs



