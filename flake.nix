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
      flake = {
        # Overlay for adding dtx to other flakes
        overlays.default = final: prev: {
          dtx = final.callPackage (
            { crane, ... }:
            let
              craneLib = crane.mkLib final;
              # NOTE: source filter duplicated from perSystem (keep in sync)
              commonArgs = {
                src = final.lib.cleanSourceWith {
                  src = ./.;
                  filter =
                    path: type:
                    (craneLib.filterCargoSources path type)
                    || (final.lib.hasInfix "/templates/" path)
                    || (final.lib.hasInfix "/static/" path);
                };
                strictDeps = true;
                nativeBuildInputs = [ final.pkg-config ];
                buildInputs =
                  [
                    final.sqlite
                    final.openssl
                  ]
                  ++ final.lib.optionals final.stdenv.hostPlatform.isDarwin [
                    final.libiconv
                  ];
                DATABASE_URL = "sqlite::memory:";
                SQLX_OFFLINE = "true";
              };
              cargoArtifacts = craneLib.buildDepsOnly commonArgs;
            in
            craneLib.buildPackage (
              commonArgs
              // {
                inherit cargoArtifacts;
                meta = {
                  description = "Dev Tools eXperience - Control plane for process-compose with Nix integration";
                  homepage = "https://github.com/r17x/dtx";
                  license = with final.lib.licenses; [
                    mit
                    asl20
                  ];
                  mainProgram = "dtx";
                };
              }
            )
          ) { crane = inputs.crane; };
        };

        # NixOS module (optional, for system-wide installation)
        nixosModules.default =
          { pkgs, ... }:
          {
            environment.systemPackages = [ pkgs.dtx ];
          };
      };
    };

  inputs = {
    # Flake utilities
    flake-parts.url = "github:hercules-ci/flake-parts";

    # Nixpkgs
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nixpkgs.follows = "nixpkgs-unstable";
  };
}
