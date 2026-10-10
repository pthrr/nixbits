{
  description = "Reusable Nix helpers";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      eachSystem =
        f:
        builtins.listToAttrs (
          map (system: {
            name = system;
            value = f nixpkgs.legacyPackages.${system};
          }) systems
        );
    in
    {
      lib = {
        mkNodeLib = pkgs: import ./. { inherit pkgs; };
        inherit (import ./. { inherit (nixpkgs) lib; }) parseEnvFile;
      };

      checks = eachSystem (pkgs: import ./tests { inherit pkgs; });

      devShells = eachSystem (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            go-task
            pre-commit
            nixfmt
            nodejs
          ];
        };
      });
    };
}
