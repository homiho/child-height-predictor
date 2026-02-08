import React, { useState, useEffect } from 'react';
import { TrendingUp, Calculator, Info } from 'lucide-react';

const ChildHeightPredictor = () => {
  const [gender, setGender] = useState('male');
  const [inputMode, setInputMode] = useState('year'); // 'year' or 'week'
  
  // 年月日入力
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [ageDays, setAgeDays] = useState('');
  
  // 週日入力
  const [ageWeeks, setAgeWeeks] = useState('');
  const [ageWeekDays, setAgeWeekDays] = useState('');
  
  const [currentHeight, setCurrentHeight] = useState('');
  const [customMonths, setCustomMonths] = useState('6');
  const [convertedAge, setConvertedAge] = useState('');
  const [results, setResults] = useState(null);
  const [info, setInfo] = useState(null);

  const japaneseHeightData = {
    male: {
      0: 49.0, 6: 67.4, 12: 75.6, 18: 81.8, 24: 87.3, 30: 91.9, 36: 95.8,
      48: 102.0, 60: 108.2, 72: 115.0, 84: 121.5, 96: 127.5, 108: 133.5,
      120: 139.0, 132: 145.5, 144: 152.5, 156: 160.0, 168: 165.5, 180: 169.0,
      192: 170.5, 204: 171.0, 216: 171.5
    },
    female: {
      0: 48.5, 6: 65.8, 12: 74.1, 18: 80.3, 24: 86.0, 30: 90.5, 36: 94.5,
      48: 100.5, 60: 106.5, 72: 113.5, 84: 120.5, 96: 127.0, 108: 134.0,
      120: 141.0, 132: 147.5, 144: 152.0, 156: 155.0, 168: 156.5, 180: 157.5,
      192: 158.0, 204: 158.0, 216: 158.0
    }
  };

  const getStandardDeviation = (months) => {
    if (months < 12) return 1.5;
    if (months < 24) return 2.0;
    if (months < 72) return 3.0;
    if (months < 144) return 4.5;
    return 6.0;
  };

  // 総月齢を計算
  const getTotalMonths = () => {
    if (inputMode === 'year') {
      const years = parseInt(ageYears) || 0;
      const months = parseInt(ageMonths) || 0;
      const days = parseInt(ageDays) || 0;
      return years * 12 + months + (days / 30.44);
    } else {
      const weeks = parseInt(ageWeeks) || 0;
      const days = parseInt(ageWeekDays) || 0;
      const totalDays = weeks * 7 + days;
      return totalDays / 30.44;
    }
  };

  // 年齢表示の更新
  useEffect(() => {
    if (inputMode === 'year') {
      const years = parseInt(ageYears) || 0;
      const months = parseInt(ageMonths) || 0;
      const days = parseInt(ageDays) || 0;
      const totalDays = years * 365.25 + months * 30.44 + days;
      const weeks = Math.floor(totalDays / 7);
      const remainDays = Math.round(totalDays % 7);
      setConvertedAge(`(約${weeks}週${remainDays}日)`);
    } else {
      const weeks = parseInt(ageWeeks) || 0;
      const days = parseInt(ageWeekDays) || 0;
      const totalDays = weeks * 7 + days;
      const years = Math.floor(totalDays / 365.25);
      const remainDaysAfterYears = totalDays - (years * 365.25);
      const months = Math.floor(remainDaysAfterYears / 30.44);
      const remainDays = Math.round(remainDaysAfterYears - (months * 30.44));
      
      let ageStr = '';
      if (years > 0) ageStr += `${years}歳`;
      if (months > 0) ageStr += `${months}ヶ月`;
      if (remainDays > 0) ageStr += `${remainDays}日`;
      setConvertedAge(ageStr ? `(約${ageStr})` : '');
    }
  }, [inputMode, ageYears, ageMonths, ageDays, ageWeeks, ageWeekDays]);

  const interpolate = (x, x1, y1, x2, y2) => {
    if (x1 === x2) return y1;
    return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
  };

  const getAverageHeight = (gender, months) => {
    const data = japaneseHeightData[gender];
    const dataPoints = Object.keys(data).map(Number).sort((a, b) => a - b);
    
    if (months >= 216) return data[216];
    if (data[months]) return data[months];
    
    let lower = dataPoints[0];
    let upper = dataPoints[dataPoints.length - 1];
    
    for (let i = 0; i < dataPoints.length - 1; i++) {
      if (dataPoints[i] <= months && months <= dataPoints[i + 1]) {
        lower = dataPoints[i];
        upper = dataPoints[i + 1];
        break;
      }
    }
    
    return interpolate(months, lower, data[lower], upper, data[upper]);
  };

  // 90%範囲の計算（平均±1.645SD）
  const get90PercentRange = (gender, months) => {
    const avg = getAverageHeight(gender, months);
    const sd = getStandardDeviation(months);
    const lower = avg - (1.645 * sd);
    const upper = avg + (1.645 * sd);
    return { lower: lower.toFixed(1), upper: upper.toFixed(1) };
  };

  const getHeightDifference = (gender, currentMonths, currentHeight) => {
    const avgHeight = getAverageHeight(gender, currentMonths);
    return currentHeight - avgHeight;
  };

  const checkHeightRange = (gender, months, height) => {
    const avgHeight = getAverageHeight(gender, months);
    const sd = getStandardDeviation(months);
    const difference = Math.abs(height - avgHeight);
    const sdCount = difference / sd;
    
    if (sdCount > 2.5) {
      return {
        showInfo: true,
        message: '個人差の範囲が大きいため、このアプリの予測は参考程度にご覧ください。お子様の成長について気になることがあれば、健診や小児科で相談されることをお勧めします。'
      };
    } else if (sdCount > 2.0) {
      return {
        showInfo: true,
        message: '個人差の範囲内ですが、予測は参考程度にご覧ください。'
      };
    }
    
    return { showInfo: false };
  };

  const predictHeight = (gender, currentMonths, currentHeight, futureMonths) => {
    const maxGrowthMonths = gender === 'male' ? 216 : 204;
    if (futureMonths >= maxGrowthMonths) futureMonths = maxGrowthMonths;
    
    const heightDiff = getHeightDifference(gender, currentMonths, currentHeight);
    const futureAvgHeight = getAverageHeight(gender, futureMonths);
    
    const ageFactor = currentMonths < 120 ? 1.0 : 0.85;
    const predictedHeight = futureAvgHeight + (heightDiff * ageFactor);
    
    return predictedHeight;
  };

  const calculatePrediction = () => {
    const height = parseFloat(currentHeight);
    const predictionMonths = parseInt(customMonths) || 6;
    
    if (isNaN(height) || height <= 0) {
      alert('有効な身長を入力してください');
      return;
    }
    
    if (predictionMonths < 1 || predictionMonths > 11) {
      alert('予測期間は1〜11ヶ月の間で選択してください');
      return;
    }
    
    const totalMonths = getTotalMonths();
    
    if (totalMonths > 216) {
      alert('18歳以下のお子様の情報を入力してください');
      return;
    }
    
    const rangeCheck = checkHeightRange(gender, totalMonths, height);
    setInfo(rangeCheck.showInfo ? rangeCheck : null);
    
    const customPeriodHeight = predictHeight(gender, totalMonths, height, totalMonths + predictionMonths);
    const oneYearHeight = predictHeight(gender, totalMonths, height, totalMonths + 12);
    
    const heightRange = get90PercentRange(gender, totalMonths);
    
    let ageDisplay = '';
    if (inputMode === 'year') {
      const years = parseInt(ageYears) || 0;
      const months = parseInt(ageMonths) || 0;
      const days = parseInt(ageDays) || 0;
      if (years > 0) {
        ageDisplay = `${years}歳${months}ヶ月`;
        if (days > 0) ageDisplay += `${days}日`;
      } else if (months > 0) {
        ageDisplay = `${months}ヶ月`;
        if (days > 0) ageDisplay += `${days}日`;
      } else {
        ageDisplay = `${days}日`;
      }
    } else {
      const weeks = parseInt(ageWeeks) || 0;
      const days = parseInt(ageWeekDays) || 0;
      ageDisplay = `${weeks}週`;
      if (days > 0) ageDisplay += `${days}日`;
    }
    
    setResults({
      customPeriod: customPeriodHeight.toFixed(1),
      customMonths: predictionMonths,
      oneYear: oneYearHeight.toFixed(1),
      currentAge: ageDisplay,
      currentHeight: height.toFixed(1),
      heightRangeLower: heightRange.lower,
      heightRangeUpper: heightRange.upper
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={32} className="text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">身長予測アプリ</h1>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
            <p className="text-sm text-blue-800 mb-2">
              数ヶ月後と1年後の身長を予測して表示するアプリです
            </p>
            <p className="text-xs text-blue-700">
              日本人の成長曲線データ(厚生労働省)に基づいて予測します
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                性別
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    gender === 'male'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  男の子
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    gender === 'female'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  女の子
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                年齢入力方法
              </label>
              <div className="flex gap-4 mb-3">
                <button
                  onClick={() => setInputMode('year')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    inputMode === 'year'
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                      : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  年月日で入力
                </button>
                <button
                  onClick={() => setInputMode('week')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    inputMode === 'week'
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                      : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  週日で入力
                </button>
              </div>

              {inputMode === 'year' ? (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">
                    現在の年齢 {convertedAge && <span className="text-indigo-600">{convertedAge}</span>}
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="18"
                          value={ageYears}
                          onChange={(e) => setAgeYears(e.target.value)}
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        />
                        <span className="absolute right-4 top-3 text-gray-500">歳</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={ageMonths}
                          onChange={(e) => setAgeMonths(e.target.value)}
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        />
                        <span className="absolute right-4 top-3 text-gray-500">ヶ月</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={ageDays}
                          onChange={(e) => setAgeDays(e.target.value)}
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        />
                        <span className="absolute right-4 top-3 text-gray-500">日</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">
                    現在の年齢 {convertedAge && <span className="text-indigo-600">{convertedAge}</span>}
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={ageWeeks}
                          onChange={(e) => setAgeWeeks(e.target.value)}
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        />
                        <span className="absolute right-4 top-3 text-gray-500">週</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="6"
                          value={ageWeekDays}
                          onChange={(e) => setAgeWeekDays(e.target.value)}
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        />
                        <span className="absolute right-4 top-3 text-gray-500">日</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                現在の身長
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={currentHeight}
                  onChange={(e) => setCurrentHeight(e.target.value)}
                  placeholder="例: 100.5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
                <span className="absolute right-4 top-3 text-gray-500">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                短期予測期間(1〜11ヶ月)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="11"
                  value={customMonths}
                  onChange={(e) => setCustomMonths(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
                <span className="absolute right-4 top-3 text-gray-500">ヶ月後</span>
              </div>
            </div>

            <button
              onClick={calculatePrediction}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Calculator size={20} />
              予測する
            </button>
          </div>

          {info && (
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded flex gap-3">
              <Info className="text-blue-500 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold mb-1 text-blue-800">参考情報</h3>
                <p className="text-sm text-blue-700">
                  {info.message}
                </p>
              </div>
            </div>
          )}

          {results && (
            <div className="mt-8 space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">予測結果</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-indigo-200">
                    <span className="font-medium text-gray-700">現在({results.currentAge})</span>
                    <span className="text-2xl font-bold text-gray-900">{results.currentHeight} cm</span>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 mb-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">同年齢の90%の子の身長</span>
                      <span className="font-semibold text-indigo-700">{results.heightRangeLower}〜{results.heightRangeUpper} cm</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-indigo-200">
                    <span className="font-medium text-gray-700">{results.customMonths}ヶ月後の予測</span>
                    <span className="text-2xl font-bold text-indigo-600">{results.customPeriod} cm</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-700">1年後の予測</span>
                    <span className="text-2xl font-bold text-indigo-600">{results.oneYear} cm</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800 leading-relaxed">
                  ※ この予測は厚生労働省の成長曲線データに基づく統計的な目安です。<br/>
                  ※ 個人差、遺伝、栄養、生活環境により実際の成長は異なります。<br/>
                  ※ 成長に関して心配なことがあれば、健診や小児科でご相談ください。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildHeightPredictor;