FROM mcr.microsoft.com/devcontainers/universal:2

RUN set -eu; \
    source_file=/etc/apt/sources.list.d/yarn.list; \
    yarn_entry='^[[:space:]]*deb(-src)?[[:space:]].*https?://dl\.yarnpkg\.com/debian/?([[:space:]]|$)'; \
    if [ ! -f "$source_file" ] || ! grep -Eq "$yarn_entry" "$source_file"; then \
        echo >&2 "Expected Yarn APT entry not found in $source_file"; \
        exit 1; \
    fi; \
    if grep -Evq "^[[:space:]]*(#.*)?$|$yarn_entry" "$source_file"; then \
        awk -v yarn_entry="$yarn_entry" '$0 !~ yarn_entry' "$source_file" > "$source_file.tmp"; \
        mv "$source_file.tmp" "$source_file"; \
    else \
        rm -- "$source_file"; \
    fi
