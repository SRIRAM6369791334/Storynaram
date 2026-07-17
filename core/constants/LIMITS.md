# Limits

## Purpose
Defines system-wide limits and thresholds.

## File System Limits
| Limit | Value |
|-------|-------|
| Max files per directory | 10,000 before subdividing |
| Max nested directory depth | 5 |
| Max filename length | 120 characters |
| Max path length (total) | 240 characters |
| Max JSON file size | 1 MB |
| Max Markdown file size | 500 KB |
| Max image file size | 50 MB |

## Entity Limits
| Limit | Value |
|-------|-------|
| Max tag name length | 30 characters |
| Max entity name length | 120 characters |
| Max description length | 2000 characters |
| Max notes length | 5000 characters |
| Max reference chain depth | 10 levels |

## Performance Thresholds
| Metric | Warning | Critical |
|--------|---------|----------|
| Files per directory | 10,000 | 100,000 |
| Total project files | 100,000 | 1,000,000 |
| Single JSON file size | 500 KB | 1 MB |
| Reference array length | 1,000 | 10,000 |

## ID Limits
| Limit | Value |
|-------|-------|
| ID prefix length | 2-5 characters |
| ID sequence width | 6 digits minimum |
| Max ID count per prefix | 999,999,999 |
