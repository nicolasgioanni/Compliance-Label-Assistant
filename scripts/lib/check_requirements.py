"""Check whether a Python environment satisfies a requirements file."""

from __future__ import annotations

from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
import sys

try:
    from pip._vendor.packaging.requirements import Requirement
except Exception as exc:  # pragma: no cover - only used for local setup diagnostics.
    print(f"Could not check installed requirements: {exc}", file=sys.stderr)
    raise SystemExit(2) from exc


def iter_requirement_lines(requirements_path: Path) -> list[str]:
    lines: list[str] = []
    for raw_line in requirements_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or line.startswith("-"):
            continue
        if " #" in line:
            line = line.split(" #", 1)[0].strip()
        lines.append(line)
    return lines


def main() -> int:
    requirements_path = Path(sys.argv[1])
    missing: list[str] = []

    for line in iter_requirement_lines(requirements_path):
        requirement = Requirement(line)
        try:
            installed_version = version(requirement.name)
        except PackageNotFoundError:
            missing.append(f"{requirement.name} is not installed")
            continue

        if requirement.specifier and not requirement.specifier.contains(
            installed_version,
            prereleases=True,
        ):
            missing.append(
                f"{requirement.name} {installed_version} does not satisfy "
                f"{requirement.specifier}",
            )

    if missing:
        print("\n".join(missing), file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
