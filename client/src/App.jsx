import "./App.css";
import KET from "./components/KET";
import Registracija from "./pages/Registracija";

function App() {
  return (
    <>
      <div className="pilna_deze">
        <article>
          <div className="foto_uzrasas">
            <div className="profilio_foto_deze">
              <img className="profilio_foto" src="./profilio.jpg"></img>
            </div>
            <div>
              <p>
                Esu praktikuojantis psichologas Oskaras Jakšaitis-Brežinskas,
                turintis 4 metų patirtį konsultavimo srityje. Savo darbe taikau
                kognityvinės elgesio terapijos (KET) metodus – mokslu grindžiamą
                praktiką, kuri leidžia efektyviai atpažinti bei keisti
                nepalankius mąstymo ir elgesio modelius. Tikiu, kad kiekvienas
                iššūkis turi sprendimą, o geresnė savijauta prasideda nuo
                saugios, atviros ir nevertinančios erdvės, kurioje galime dirbti
                kartu. Konsultacijose suaugusiesiems padedu tvarkytis su nerimu,
                panikos atakomis, kasdieniu stresu bei depresijos simptomais,
                prislėgta nuotaika ar motyvacijos stoka. Kartu ieškome konkrečių
                įrankių emocijų valdymui, savivertės stiprinimui ir vidinei
                pusiausvyrai atgauti, kad kasdienybėje atsirastų daugiau aiškumo
                ir lengvumo. Atskirą mano praktikos dalį sudaro tėvų
                konsultavimas dėl vaikų, turinčių specialiųjų ugdymosi poreikių
                (SUP). Padedu tėveliams geriau suprasti vaiko raidos, elgesio
                bei mokymosi ypatumus, teikiu praktines rekomendacijas ir
                emocinį palaikymą. Siekiu, kad šeima gautu aiškių gairių, kaip
                kurti palaikančią bei ugdančią aplinką tiek namuose, tiek
                mokykloje. Tiek dirbdamas su suaugusiaisiais, tiek
                konsultuodamas tėvus, vadovaujuosi visiško konfidencialumo,
                pagarbos ir individualaus dėmesio principais. Jei jaučiate, kad
                atėjo laikas teigiamiems pokyčiams ar reikia profesinio
                palaikymo sprendžiant iškilusius iššūkius, kviečiu susisiekti ir
                susitarti dėl pirminės konsultacijos nuotoliu.
              </p>
              <button className="Registracija">
                Registruotis konsultacijai
              </button>
            </div>
          </div>
        </article>
      </div>
      <KET />
    </>
  );
}

export default App;
