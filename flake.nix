{
  description = "development environtment";

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];

      imports = [ ];

      perSystem =
        {
          pkgs,
          lib,
          system,
          ...
        }:
        {
          # ===================================
          # Packages
          # ===================================
          packages = { };

          # ===================================
          # Apps (for `nix run`)
          # ===================================
          apps = { };

          # ===================================
          # Checks (for `nix flake check`)
          # ===================================
          checks = { };

          # ===================================
          # Development Shell
          # ===================================
          devShells.default = pkgs.mkShell {

            packages = with pkgs; [
              nodejs
            ];

            shellHook = ''
              # Setup environment
              export ROOT_REPO=$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")
              export DATA_DIR="$ROOT_REPO/.data"
              export PROJECT_ROOT="$ROOT_REPO"
              mkdir -p "$DATA_DIR"


              # Log verbose info to file (see: cat .data/shellhook.log)
              {
                echo "=== dev shell initialized: $(date) ==="
                echo ""
                echo ""
                echo "ROOT_REPO=$ROOT_REPO"
              } > "$DATA_DIR/shellhook.log" 2>&1

              npm install
            '';
          };

          # ===================================
          # Formatter (for `nix fmt`)
          # ===================================
          formatter = pkgs.nixpkgs-fmt;
        };

      # ===================================
      # Flake-wide outputs (overlays)
      # ===================================
      flake = { };
    };

  inputs = {
    # Flake utilities
    flake-parts.url = "github:hercules-ci/flake-parts";

    # Nixpkgs
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nixpkgs.follows = "nixpkgs-unstable";
  };
}
