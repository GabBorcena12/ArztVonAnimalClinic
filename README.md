# Arztvon Animal Clinic Website

## Project structure

- `ArztVonAnimalClinic/` contains the Blazor website.
- `docs/` contains the matching standalone site used by GitHub Pages.
- `ArztVonAnimalClinic/Components/Pages/Home.razor` contains the main page content.
- `ArztVonAnimalClinic/wwwroot/app.css` and `docs/site.css` contain the responsive visual styles.

The website uses styled media areas until approved clinic photographs are available. Contact actions open the visitor's phone or email app; there is no online booking service, database, login, payment flow, or external API.

## Run locally

```powershell
dotnet run --project ArztVonAnimalClinic\ArztVonAnimalClinic.csproj
```

## Build

```powershell
dotnet build ArztVonAnimalClinic.slnx -c Release
```
