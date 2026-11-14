/**
 * Deslizador de longitud de onda sobre los 102 planos del cubo. Dueño: Juan Pablo (V2). Trabajo de S1.
 * AladinView ya lo monta debajo del mapa; mientras no esté hecho, no dibuja nada.
 */
type Props = {
  /** Plano activo (0–101). */
  plano: number;
  /** Se llama cuando el usuario elige otro plano. */
  onPlano: (plano: number) => void;
  /** URL del HiPS, para leer su `properties`. */
  survey: string;
};

// TODO (S1): 102 planos rotulados con su λ en µm (de leerPlanos), sin el 50 y 51, y sincronizable con la banda D1–D6.
export default function LambdaSlider(_props: Props) {
  return null;
}
