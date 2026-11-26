(() => {
  const API_KEY_STORAGE = 'listva-image-api-key';
  const IMAGE_MODEL = 'gpt-image-1';
  const keyStatusText = () => {
    try {
      return sessionStorage.getItem(API_KEY_STORAGE) ? 'Ключ OpenAI сохранён в этой сессии браузера.' : 'Для генерации понадобится ваш собственный API-ключ OpenAI.';
    } catch (error) {
      return 'Хранилище браузера недоступно. Введите ключ перед генерацией.';
    }
  };

  function readApiKey() {
    try {
      return sessionStorage.getItem(API_KEY_STORAGE) || '';
    } catch (error) {
      return '';
    }
  }

  function setApiKey(value) {
    try {
      if (value) sessionStorage.setItem(API_KEY_STORAGE, value);
      else sessionStorage.removeItem(API_KEY_STORAGE);
      return true;
    } catch (error) {
      return false;
    }
  }

  function openApiKeyModal(onSaved) {
    openModal('<div class="modal-head"><div><h2>Ключ генерации</h2><p>Ваш личный ключ OpenAI используется только в этом браузере.</p></div><button class="close" data-close aria-label="Закрыть">×</button></div><div class="field"><label for="imageApiKey">OpenAI API-ключ</label><input id="imageApiKey" type="password" autocomplete="off" placeholder="sk-…" value="' + escapeHtml(readApiKey()) + '"></div><div class="key-warning">Ключ хранится в sessionStorage до закрытия вкладки и отправляется напрямую в OpenAI. Он не передаётся серверу «Листва». Использование API может быть платным. Создать ключ можно на platform.openai.com/api-keys.</div><div class="modal-footer"><button class="btn outline" id="removeImageKey" type="button">Удалить ключ</button><button class="btn" id="saveImageKey" type="button">Сохранить в этой сессии</button></div>');
    document.getElementById('saveImageKey').addEventListener('click', () => {
      const value = document.getElementById('imageApiKey').value.trim();
      if (!value) {
        showToast('Введите API-ключ или удалите сохранённый ключ');
        return;
      }
      if (!setApiKey(value)) {
        showToast('Браузер не разрешил сохранить ключ');
        return;
      }
      closeModal();
      showToast('Ключ сохранён до закрытия вкладки');
      if (typeof onSaved === 'function') onSaved();
    });
    document.getElementById('removeImageKey').addEventListener('click', () => {
      setApiKey('');
      closeModal();
      showToast('Ключ удалён из этой сессии');
      if (typeof onSaved === 'function') onSaved();
    });
  }

  function readPromptDraft() {
    const fields = ['plantPromptName', 'plantPromptLatin', 'plantPromptDescription', 'plantPromptWater', 'plantPromptMoisture', 'plantPromptHumidity', 'plantPromptLight', 'plantPromptAir', 'plantPromptFertilizer', 'plantPromptDislikes', 'plantPromptRisks'];
    return Object.fromEntries(fields.map(id => [id, document.getElementById(id)?.value || '']));
  }

  function openPlantPromptModal(draft = {}) {
    const val = id => escapeHtml(draft[id] || '');
    openModal('<div class="modal-head"><div><h2>Карточка по промпту</h2><p>Опишите растение и создайте для него уникальное изображение.</p></div><button class="close" data-close aria-label="Закрыть">×</button></div><div class="image-key-status" id="imageKeyStatus">' + keyStatusText() + '</div><div class="generator-form"><div class="field"><label for="plantPromptName">Название растения *</label><input id="plantPromptName" maxlength="70" placeholder="Например, Алоказия Полли" value="' + val('plantPromptName') + '"></div><div class="field"><label for="plantPromptLatin">Латинское название</label><input id="plantPromptLatin" maxlength="90" placeholder="Необязательно" value="' + val('plantPromptLatin') + '"></div><div class="field full"><label for="plantPromptDescription">Промпт изображения *</label><textarea id="plantPromptDescription" maxlength="700" placeholder="Опишите вид растения: форма листьев, цвет, размер, горшок и другие детали.">' + val('plantPromptDescription') + '</textarea></div><div class="field"><label for="plantPromptWater">Режим полива</label><input id="plantPromptWater" maxlength="120" value="' + (val('plantPromptWater') || 'Проверяйте грунт перед поливом') + '"></div><div class="field"><label for="plantPromptMoisture">Влажность грунта</label><input id="plantPromptMoisture" maxlength="120" value="' + (val('plantPromptMoisture') || 'Дайте верхнему слою подсохнуть') + '"></div><div class="field"><label for="plantPromptHumidity">Влажность воздуха</label><input id="plantPromptHumidity" maxlength="80" value="' + (val('plantPromptHumidity') || 'Не указана') + '"></div><div class="field"><label for="plantPromptLight">Предпочитаемый свет</label><input id="plantPromptLight" maxlength="120" value="' + (val('plantPromptLight') || 'Яркий рассеянный свет') + '"></div><div class="field"><label for="plantPromptAir">Воздух и температура</label><input id="plantPromptAir" maxlength="120" value="' + (val('plantPromptAir') || '18–26°C, без сквозняков') + '"></div><div class="field"><label for="plantPromptFertilizer">Удобрение</label><input id="plantPromptFertilizer" maxlength="120" value="' + (val('plantPromptFertilizer') || 'Не указано') + '"></div><div class="field"><label for="plantPromptDislikes">Что не любит</label><input id="plantPromptDislikes" maxlength="180" placeholder="Например: перелив, прямое солнце" value="' + val('plantPromptDislikes') + '"></div><div class="field"><label for="plantPromptRisks">К чему предрасположено</label><input id="plantPromptRisks" maxlength="180" placeholder="Например: паутинный клещ" value="' + val('plantPromptRisks') + '"></div></div><p class="generator-note">Изображение будет реалистичным: одно растение в кадре, светлый фон, мягкий естественный свет, минималистичная подача. Уход заполните по надёжному источнику: генератор изображений не проверяет ботанические советы.</p><div class="key-warning">Промпт и ваш API-ключ отправляются напрямую в OpenAI. Генерация может тарифицироваться OpenAI отдельно.</div><div class="generator-status" id="imageGenerationStatus" aria-live="polite"></div><div class="modal-footer"><button class="btn outline" id="configureImageKey" type="button">Настроить ключ</button><button class="btn" id="generatePlantCard" type="button">Сгенерировать и создать</button></div>', true);
    document.getElementById('configureImageKey').addEventListener('click', () => {
      openApiKeyModal(() => openPlantPromptModal(readPromptDraft()));
    });
    document.getElementById('generatePlantCard').addEventListener('click', generatePlantCard);
  }

  function splitTraits(value) {
    return value.split(/[,;\n]+/).map(item => item.trim()).filter(Boolean).slice(0, 8);
  }

  function compressGeneratedImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onerror = () => reject(new Error('Не удалось обработать полученное изображение'));
      image.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Браузер не смог подготовить изображение'));
          return;
        }
        context.fillStyle = '#f7f7f1';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        } catch (error) {
          reject(error);
        }
      };
      image.src = dataUrl;
    });
  }

  async function generatePlantCard() {
    const button = document.getElementById('generatePlantCard');
    const status = document.getElementById('imageGenerationStatus');
    const name = document.getElementById('plantPromptName').value.trim();
    const description = document.getElementById('plantPromptDescription').value.trim();
    const apiKey = readApiKey();
    if (!apiKey) {
      const draft = readPromptDraft();
      openApiKeyModal(() => openPlantPromptModal(draft));
      return;
    }
    if (!name || !description) {
      status.textContent = 'Заполните название растения и описание изображения.';
      return;
    }
    button.disabled = true;
    button.textContent = 'Создаём изображение…';
    status.textContent = 'Генерация может занять до минуты. Не закрывайте это окно.';
    try {
      const prompt = 'Create a highly realistic botanical product photograph of ' + name + '. ' + description + ' Show one complete potted plant, centered and clearly recognizable, isolated against a clean warm off-white background, soft natural diffused daylight, subtle realistic shadows, refined minimal editorial photography, lifelike leaves and natural texture, portrait composition. No text, no labels, no watermark, no collage, no extra plants.';
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          prompt,
          size: '1024x1024',
          quality: 'medium'
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const apiMessage = result.error && result.error.message;
        if (response.status === 401) throw new Error('OpenAI не принял ключ. Проверьте его в настройках генерации.');
        if (response.status === 429) throw new Error('Лимит или баланс OpenAI исчерпан. Проверьте настройки аккаунта и тарификацию.');
        throw new Error(apiMessage || 'OpenAI вернул ошибку ' + response.status + '. Проверьте ключ и доступность модели.');
      }
      const encoded = result.data && result.data[0] && result.data[0].b64_json;
      if (!encoded) throw new Error('OpenAI не вернул изображение. Попробуйте ещё раз.');
      const photo = await compressGeneratedImage('data:image/png;base64,' + encoded);
      const latin = document.getElementById('plantPromptLatin').value.trim();
      const plant = {
        id: 'prompt-' + name.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 35) + '-' + Date.now(),
        name,
        latin: latin || 'Вид не указан',
        location: 'Место не указано',
        light: document.getElementById('plantPromptLight').value.trim(),
        water: document.getElementById('plantPromptWater').value.trim(),
        moisture: document.getElementById('plantPromptMoisture').value.trim(),
        humidity: document.getElementById('plantPromptHumidity').value.trim(),
        air: document.getElementById('plantPromptAir').value.trim(),
        fertilizer: document.getElementById('plantPromptFertilizer').value.trim(),
        groups: {
          humidity: document.getElementById('plantPromptHumidity').value.trim() || 'Не указана',
          watering: document.getElementById('plantPromptWater').value.trim() || 'Не указан',
          light: document.getElementById('plantPromptLight').value.trim() || 'Не указан',
          air: document.getElementById('plantPromptAir').value.trim() || 'Не указан'
        },
        dislikes: splitTraits(document.getElementById('plantPromptDislikes').value),
        predispositions: splitTraits(document.getElementById('plantPromptRisks').value),
        waterIn: 7,
        level: 45,
        status: 'Наблюдаем',
        tone: 'good',
        style: 'custom',
        photo,
        treatment: { active: false, reason: '', startedAt: '', tasks: [], observations: [] }
      };
      plantData.push(plant);
      if (typeof savePlantData === 'function') savePlantData();
      if (typeof renderPlants === 'function') renderPlants();
      closeModal();
      if (typeof switchView === 'function') switchView('plants');
      showToast('Карточка «' + name + '» создана');
    } catch (error) {
      status.textContent = error.message || 'Не удалось создать карточку.';
    } finally {
      const currentButton = document.getElementById('generatePlantCard');
      if (currentButton) {
        currentButton.disabled = false;
        currentButton.textContent = 'Сгенерировать и создать';
      }
    }
  }

  document.getElementById('createPlantPrompt').addEventListener('click', () => openPlantPromptModal());
  document.getElementById('manageImageKey').addEventListener('click', () => openApiKeyModal());
})();
