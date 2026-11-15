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
  $logTurno = "logs/turno_$carimbo.log"          # resumo final do agente (legivel)
  $logTrilha = "logs/turno_$carimbo.jsonl"       # trilha completa: cada acao do agente
  $logErros = "logs/turno_${carimbo}_erros.log"
  $logVerificacao = "logs/verificacao_$carimbo.log"
  $statusAntes = (node scripts/features.mjs status) -join ' '
  $funcionalidade = if ($statusAntes -match '(F\d+)') { $Matches[1] } else { '?' }
  Write-Host ''
  Write-Host "=== Turno $i de $Turnos  |  $statusAntes"
  Write-Host "    Modelo: $Modelo ($Esforco)  |  Log: $logTurno"

  # 2. O turno do agente
  $inicio = Get-Date
  & claude -p $prompt --model $Modelo --effort $Esforco --permission-mode auto --permission-prompts none --output-format stream-json --verbose 2> $logErros |
    Out-File -Encoding utf8 $logTrilha
  $codigo = $LASTEXITCODE
  $minutos = [math]::Round(((Get-Date) - $inicio).TotalMinutes, 1)

  # O ultimo evento da trilha ("result") traz o resumo e o consumo do turno
  $resultado = $null
  Get-Content $logTrilha -Encoding utf8 | Where-Object { $_ -match '"type":"result"' } | Select-Object -Last 1 |
    ForEach-Object { try { $resultado = $_ | ConvertFrom-Json } catch { } }

  if ($resultado) {
    $resultado.result | Out-File -Encoding utf8 $logTurno
    $u = $resultado.usage
    $tokensEntrada = [int64]$u.input_tokens + [int64]$u.cache_read_input_tokens + [int64]$u.cache_creation_input_tokens
    $custo = [math]::Round([double]$resultado.total_cost_usd, 2)
    $concluiu = [int](node scripts/features.mjs restantes) -lt $restantes

    # Planilha de consumo: base para comparar modelos (Fase 3) e estimar a rodada longa
    if (-not (Test-Path logs/consumo.csv)) {
      'data;funcionalidade;concluiu;modelo;esforco;minutos;passos_do_agente;tokens_entrada;tokens_saida;custo_api_usd' |
        Out-File -Encoding utf8 logs/consumo.csv
    }
    "$carimbo;$funcionalidade;$concluiu;$Modelo;$Esforco;$minutos;$($resultado.num_turns);$tokensEntrada;$($u.output_tokens);$custo" |
      Out-File -Encoding utf8 -Append logs/consumo.csv

    Write-Host "    Turno terminou em $minutos min, $($resultado.num_turns) passos, ~US`$ $custo em precos de API (codigo: $codigo)."
    Write-Host '    Resumo do agente:'
    Get-Content $logTurno -Encoding utf8 | ForEach-Object { Write-Host "      $_" }
  } else {
    Write-Host "    Turno terminou em $minutos min (codigo: $codigo), sem resumo. Veja $logErros e $logTrilha."
  }

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
