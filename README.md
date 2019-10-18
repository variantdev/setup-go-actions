# setup-go-actions

<p align="left">
  <a href="https://github.com/variantdev/setup-go-actions"><img alt="GitHub Actions status" src="https://github.com/variantdev/setup-go-actions/workflows/Main%20workflow/badge.svg"></a>
</p>

This action sets up a [`go-actions`](https://github.com/variantdev/go-actions) environment for use in GitHub Actions by:

- optionally downloading and caching a version of `go-actions` by version and adding to PATH
- registering problem matchers for error output

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@master
- uses: variantdev/setup-go-actions@v1
  with:
    go-actions-version: '0.5.0' # The actions version to download (if necessary) and use.
- run: actions -help
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

# Contributions

Contributions are welcome!  See [Contributor's Guide](docs/contributors.md)
