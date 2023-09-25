import { renderToReadableStream } from "react-dom/server";
import Pokemon from "./src/components/Pokemon";
import PokemonList from "./src/components/PokemonList";
import { PokemonResponse } from "./src/types/PokemonResponse";
import { PokemonsResponse } from "./src/types/PokemonsResponse";

Bun.serve({
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/pokemon") {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon");

      const { results } = (await response.json()) as PokemonsResponse;

      const stream = await renderToReadableStream(
        <PokemonList pokemon={results} />
      );

      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    const pokemonNameRegex = /^\/pokemon\/([a-zA-Z0-9_-]+)$/;
    const match = url.pathname.match(pokemonNameRegex);
    console.log(match);

    if (match) {
      const pokemonName = match[1];

      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
      );

      if (response.status === 404) {
        return new Response("Not Found", { status: 404 });
      }

      const {
        height,
        name,
        weight,
        sprites: { front_default },
      } = (await response.json()) as PokemonResponse;

      const stream = await renderToReadableStream(
        <Pokemon
          name={name}
          height={height}
          weight={weight}
          img={front_default}
        />
      );

      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Listening ...");
