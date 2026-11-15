# Motor de turnos do Aprendrez.
#
# Roda o agente (Claude Code) um turno atrás do outro. Cada turno é uma sessão
# nova, sem memória das anteriores, que segue scripts/prompt-turno.md.
# Entre um turno e outro, ESTE script (e não o agente) confere o trabalho.
#
# Uso (pelo npm):
#   npm run turnos                                # 1 turno, Opus
#   npm run turnos -- -Turnos 10                  # até 10 turnos
#   npm run turnos -- -Turnos 5 -Modelo sonnet    # outro modelo
#
# Para parar com segurança no fim do turno atual, crie um arquivo chamado
# PARAR na pasta do projeto. O script o apaga quando para.

param(
  [int]$Turnos = 1,
  [string]$Modelo = 'opus',
  [string]$Esforco = 'high'
)

$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
New-Item -ItemType Directory -Force logs | Out-Null

$prompt = 'Leia o arquivo scripts/prompt-turno.md e execute exatamente um turno, seguindo a rotina descrita nele.'
$falhasSeguidas = 0

for ($i = 1; $i -le $Turnos; $i++) {

  # 1. Condicoes de parada antes de comecar
  if (Test-Path PARAR) {
    Remove-Item PARAR
    Write-Host 'Arquivo PARAR encontrado. Parando antes do proximo turno.'
    break
  }
  $restantes = [int](node scripts/features.mjs restantes)
  if ($restantes -eq 0) {
    Write-Host 'Todas as funcionalidades passam. Nada mais a fazer.'
    break
  }

  $assinaturaAntes = node scripts/features.mjs assinatura
  $carimbo = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
  $logTurno = "logs/turno_$carimbo.log"
  $logVerificacao = "logs/verificacao_$carimbo.log"
  $statusAntes = (node scripts/features.mjs status) -join ' '
  Write-Host ''
  Write-Host "=== Turno $i de $Turnos  |  $statusAntes"
  Write-Host "    Modelo: $Modelo ($Esforco)  |  Log: $logTurno"

  # 2. O turno do agente
  $inicio = Get-Date
  & claude -p $prompt --model $Modelo --effort $Esforco --permission-mode auto --permission-prompts none --output-format text 2>&1 |
    Out-File -Encoding utf8 $logTurno
  $codigo = $LASTEXITCODE
  $minutos = [math]::Round(((Get-Date) - $inicio).TotalMinutes, 1)
  Write-Host "    Turno terminou em $minutos min (codigo de saida: $codigo). Resumo do agente:"
  Get-Content $logTurno -Tail 6 | ForEach-Object { Write-Host "      $_" }

  if ($codigo -ne 0) {
    Write-Warning 'O agente terminou com erro (talvez limite de uso ou falha de rede). Parando.'
    break
  }

  # 3. O harness confere o agente
  $assinaturaDepois = node scripts/features.mjs assinatura
  if ($assinaturaDepois -ne $assinaturaAntes) {
    Write-Warning 'features.json foi alterado alem do campo "passes". Isso viola as regras. Parando para revisao humana.'
    break
  }

  if (git status --porcelain) {
    Write-Warning 'O turno deixou alteracoes sem commit. Elas serao vistas pelo proximo turno.'
  }

  Write-Host '    Verificacao independente (npm run verificar)...'
  npm run verificar 2>&1 | Out-File -Encoding utf8 $logVerificacao
  if ($LASTEXITCODE -ne 0) {
    $falhasSeguidas++
    Write-Warning "A verificacao falhou ($falhasSeguidas seguida(s)). Detalhes: $logVerificacao"
    if ($falhasSeguidas -ge 2) {
      Write-Warning 'Duas falhas seguidas. Parando para revisao humana.'
      break
    }
  } else {
    $falhasSeguidas = 0
    Write-Host '    Verificacao OK.'
  }
}

Write-Host ''
Write-Host "=== Fim. $((node scripts/features.mjs status) -join ' ')"
